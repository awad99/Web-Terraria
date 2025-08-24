// @/Examples/tilesSet.ts
import { Texture } from "@/Renderer/Texture";
import { Vector2, Vector3 } from "@/Math/Vectors";
import { CSprite } from "@/Scene/Components";

export class TileSet {
    private texture: Texture;
    private tileWidth: number;
    private tileHeight: number;
    private textureWidth: number;
    private textureHeight: number;
    private gap: number = 2; // Gap between tiles

    constructor(texture: Texture, tileWidth: number, tileHeight: number) {
        this.texture = texture;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.textureWidth = texture.GetSize().x;
        this.textureHeight = texture.GetSize().y;
    }

    public getTextureCoords(tileX: number, tileY: number, flipX: boolean): [number, number, number, number] {
        const pixelSize = new Vector3(1 / this.textureWidth, 1 / this.textureHeight);
        const indent = new Vector3(0.25 * pixelSize.x, 0.25 * pixelSize.y);

        // Calculate tile position including gap
        const beginX = tileX * (this.tileWidth + this.gap);
        const beginY = tileY * (this.tileHeight + this.gap);
        const endX = beginX + this.tileWidth;
        const endY = beginY + this.tileHeight;

        // Convert to texture coordinates
        let left = beginX * pixelSize.x;
        let top = 1 - (beginY * pixelSize.y); // Flip Y for OpenGL-style coords
        let right = endX * pixelSize.x;
        let bottom = 1 - (endY * pixelSize.y); // Flip Y for OpenGL-style coords

        // Apply indent (anti-texture-bleeding)
        left += indent.x;
        top -= indent.y;
        right -= indent.x;
        bottom += indent.y;

        return flipX 
            ? [right, bottom, left, top]
            : [left, bottom, right, top];
    }


    private getTextureBranchCoords(tileX: number, tileY: number, flipX: boolean = false): [number, number, number, number] {
        const cols = 8;
        const rows = 12;

        const tileWidth = 1 / cols;
        const tileHeight = 1 / rows;

        let u = tileX * tileWidth;
        let v = 1 - (tileY + 1) * tileHeight;

        let u1 = u + tileWidth;
        let v1 = v + tileHeight;

        if (flipX) {
            [u, u1] = [u1, u]; // Flip horizontally
        }

        return [u, v, u1, v1]; // left, bottom, right, top
    }

    public setTileUVs(sprite: CSprite, tileX: number, tileY: number, flipX: boolean = false): void {
        const [left, bottom, right, top] = this.getTextureCoords(tileX, tileY, flipX);

        // Create UVs in order: bottom-left, bottom-right, top-right, top-left
        sprite.UVs = new Float32Array([
            left, bottom,  // bottom-left
            right, bottom, // bottom-right
            right, top,    // top-right
            left, top      // top-left
        ]);
    }

    public setTreeBranchUVs(sprite: CSprite, tileX: number, tileY: number, flipX: boolean = false): void {
        const [left, bottom, right, top] = this.getTextureBranchCoords(tileX, tileY, flipX);

        // Create UVs in order: bottom-left, bottom-right, top-right, top-left
        sprite.UVs = new Float32Array([
            left, bottom,  // bottom-left
            right, bottom, // bottom-right
            right, top,    // top-right
            left, top      // top-left
        ]);
    }
    public setTreeTileUVs(
        sprite: CSprite,
        treeIndex: number,
        flipX: boolean = false
    ): void {
        const tilesPerRow = 3;
        const tileWidth = 1 / tilesPerRow;

        // UVs
        let left = treeIndex * tileWidth;
        let right = left + tileWidth;
        let top = 0;
        let bottom = 1;

        // Flip horizontally
        if (flipX) {
            [left, right] = [right, left];
        }

        [top, bottom] = [bottom, top];


        sprite.UVs = new Float32Array([
            left, bottom,  
            right, bottom, 
            right, top,   
            left, top     
        ]);

        sprite.Size = new Vector3(5, 5, 1.5);
    }

    public getTileCoords(tileX: number, tileY: number): Vector3 {
        const [left, bottom, right] = this.getTextureCoords(tileX, tileY, false);
        const width = right - left;
        return new Vector3(left, bottom, width);
    }
}


// // Alternative approach: Single tileset with both textures
// public async createTileMapWithCombinedTexture(position: Vector3): Promise<void> {
//     // If you have a single texture atlas containing both dirt and grass tiles
//     const combinedTexture = this.tileManager.getTexture(TilesType.COMBINED);
    
//     if (!combinedTexture) {
//         console.error("Combined texture not loaded!");
//         return;
//     }

//     const tileSet = new TileSet(combinedTexture, 16, 16);
//     const tileWidth = 20;
//     const tileHeight = 20;
//     const mapWidth = 10;
//     const mapHeight = 30;

//     for (let y = 0; y < mapHeight; y++) {
//         for (let x = 0; x < mapWidth; x++) {
//             const tile = this.entityManager.AddEntity(ENTITY_TYPE.TILE);
//             const sprite = this.entityManager.AddComponent(tile, COMPONENT_TYPE.SPRITE);
            
//             if (sprite) {
//                 sprite.Texture = combinedTexture;
                
//                 const isGrassTile = y === mapHeight - 1 && (x === 0 || x === mapWidth - 1);
                
//                 if (isGrassTile) {
//                     // Use grass tile coordinates from the combined texture
//                     const [grassTileX, grassTileY] = this.getGrassTileCoords(); // You need to implement this
//                     tileSet.setTileUVs(sprite, grassTileX, grassTileY, false);
//                 } else {
//                     // Use dirt tile coordinates from the combined texture
//                     const tileType = this.getTileType(x, y, mapWidth, mapHeight);
//                     const [tileX, tileY] = this.getTilesetCoordsFromType(tileType);
//                     tileSet.setTileUVs(sprite, tileX, tileY, false);
//                 }

//                 sprite.Position = new Vector3(
//                     position.x + (x * tileWidth),
//                     position.y + (y * tileHeight),
//                     position.z
//                 );

//                 this.tileEntities.push(tile);
//             }
//         }
//     }
// }