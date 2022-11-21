import {Project, PropertyAssignment, SyntaxKind} from "ts-morph";
import CodeBlockWriter from "code-block-writer"

const project = new Project({
        tsConfigFilePath: "tsconfig.json",
    }
);

interface ITypeDefProp {
    key:string
    type:string
}

interface ITypeDefFunc extends ITypeDefProp{
    params:ITypeDefProp[]
}

interface ITypedefAst{
    name:string
    properties:ITypeDefProp[]
}

const typedefAst:ITypedefAst[] = []
const queries:ITypeDefFunc[] = []

project.getSourceFiles().filter(sourceFile=>sourceFile.getDirectory().getBaseName() == 'GraphqlApi').forEach(sourceFile=>{
        const resolversQueryDeclaration =  sourceFile.getVariableDeclaration("resolvers").getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)?.getProperty("Query") as PropertyAssignment

        resolversQueryDeclaration.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression).getProperties().forEach(queryDeclaration=>{

            if(queryDeclaration instanceof PropertyAssignment){
                const functionDeclaration = queryDeclaration.getInitializerIfKind(SyntaxKind.ArrowFunction)
                const returnType = functionDeclaration.getReturnType()
                let declaration = returnType.getSymbol().getDeclarations()[0].asKind(SyntaxKind.ClassDeclaration)

                if(returnType.isArray()){
                    declaration = returnType.getArrayElementType().getSymbol().getDeclarations()[0].asKind(SyntaxKind.ClassDeclaration)
                }
                const graphqlQueryReturnType = returnType.isArray()?`[${declaration.getStructure().name}]`:declaration.getStructure().name
                queries.push({key:queryDeclaration.getName(),type:graphqlQueryReturnType,params:functionDeclaration.getParameters().map(param=>({key:param.getName(),type:param.getType().getText()}))})

                if (typedefAst.find(typedef=>typedef.name == declaration.getStructure().name)){
                    return;
                }
                const graphqlAstObj :ITypedefAst= {
                    name :declaration.getStructure().name,
                    // @ts-ignore
                    properties : declaration.getStructure().properties.filter(el=>el.scope == 'public'&&!el.isStatic).map(prop=>{
                        return {
                            key:prop.name,
                            type:prop.type
                        }
                    })
                }
                typedefAst.push(graphqlAstObj)
                console.log(graphqlAstObj)
            }
        })
})
function mapJsPrimitivesToGraphql(type:string){
    if(type.includes("[]")){
        return `[${mapJsPrimitivesToGraphql(type.replace("[]",""))}]`
    }
    switch (type){
        case "string":return "String";
        case "number":return "Integer";
        default : return type
    }
}

const typeDefsFile = project.getSourceFiles().find(sourceFile=>sourceFile.getBaseName() == "typeDefs.ts")


const generateGraphqlSchema = ()=>{
    const writer = new CodeBlockWriter();
    writer.writeLine("#graphql")
    for (const typeAst of typedefAst){
        writer.writeLine(`type ${typeAst.name} {`)
        for (const prop  of typeAst.properties){
            writer.writeLine(`  ${prop.key}: ${mapJsPrimitivesToGraphql(prop.type)}`)
        }
        writer.writeLine(`}`)
    }

    writer.writeLine("type Query {")
    for (const query of queries){
        if(query.params.length>0){
            writer.write(`  ${query.key}(`)
            for (const param of query.params){
                if(query.params.indexOf(param)>0){
                    writer.write(",")
                }
                writer.write(`${param.key}:${mapJsPrimitivesToGraphql(param.type)}`)
            }
            writer.write(`): ${query.type}`)
        }else {
            writer.writeLine(`  ${query.key}: ${query.type}`)
        }
    }
    writer.writeLine("}")
    return writer.toString()
}

typeDefsFile.getVariableDeclaration("generatedTypedef").getInitializerIfKind(SyntaxKind.NoSubstitutionTemplateLiteral).setLiteralValue(generateGraphqlSchema())

typeDefsFile.save()