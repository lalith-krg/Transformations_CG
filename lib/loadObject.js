export class LoadObject
{

    constructor(filename)
    {
        this.filename = filename;
    }

    getObjectData()
    {
        return this.parseOBJ();
    }

    async initialiseObject()
    {
        let response = await fetch(this.filename);
        let newText = await response.text();
        return newText;
    }

    setText(text)
    {
        this.text = text;
    }


    async parseOBJ() 
    {
        var text = await this.initialiseObject();
        // because indices are base 1 let's just fill in the 0th data
        const objPositions = [[0, 0, 0]];
        const objTexcoords = [[0, 0]];
        const objNormals = [[0, 0, 0]];
    
        // same order as `f` indices
        let objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
        ];
    
        // same order as `f` indices
        let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
        ];
    
        function addVertex(vert) 
        {
            const ptn = vert.split('/');
            ptn.forEach((objIndexStr, i) => {
                if (!objIndexStr) {
                return;
                }
                const objIndex = parseInt(objIndexStr);
                const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
                webglVertexData[i].push(...objVertexData[i][index]);
            });
        }


        const keywords = 
        {
            v(parts) {
            objPositions.push(parts.map(parseFloat));
            },
            vn(parts) {
            objNormals.push(parts.map(parseFloat));
            },
            vt(parts) {
            objTexcoords.push(parts.map(parseFloat));
            },
            f(parts) {
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
            },
        };

        const keywordRE = /(\w*)(?: )*(.*)/;
        const lines = text.split('\n');
        for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
            const line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
            continue;
            }
            const m = keywordRE.exec(line);
            if (!m) {
            continue;
            }
            const [, keyword, unparsedArgs] = m;
            const parts = line.split(/\s+/).slice(1);
            const handler = keywords[keyword];
            if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
            }
            handler(parts, unparsedArgs);
        }



        return {
            position: webglVertexData[0],
            texcoord: webglVertexData[1],
            normal: webglVertexData[2],
        };
    }; 

};