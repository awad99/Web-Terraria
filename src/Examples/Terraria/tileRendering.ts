// tileManager.ts
import { TileSet } from "@/Examples/Terraria/tilesSet";
import { HANDLER_TYPE, ResourceManager } from "@/ResourceManagement/ResourceManager";
import { Texture } from "@/Renderer/Texture";
import { TilesType } from "@/Examples/Terraria/tiles";

export class TileManager {
    private tileTextures: Map<number, Texture> = new Map();
    private tileSet?: TileSet;
    
    constructor(private resourceManager: ResourceManager) {}

    public async loadAll(): Promise<void> {
        const textureManager = this.resourceManager.GetHandler(HANDLER_TYPE.TEXTURE);
        
        // Load all tile textures
        await Promise.all([
            this.loadTexture(textureManager, TilesType.GRASS, "/assets/textures/Tiles/grass.png"),
            this.loadTexture(textureManager, TilesType.DIRT, "/assets/textures/Tiles/dirt.png"),
            this.loadTexture(textureManager, TilesType.STONE, "/assets/textures/Tiles/stone.png"),
            this.loadTexture(textureManager, TilesType.Gold, "/assets/textures/Tiles/gold.png"),
            this.loadTexture(textureManager, TilesType.Silver, "/assets/textures/Tiles/silver.png"),
            this.loadTexture(textureManager, TilesType.TreeBranch, "/assets/textures/Tiles/Tree branch.png"),
            this.loadTexture(textureManager, TilesType.TreeNest, "/assets/textures/Tiles/Tree_Tops_0.png")
        ]);
    
        // Initialize tile set with the dirt texture as default
        const defaultTexture = this.tileTextures.get(TilesType.DIRT);
        if (defaultTexture) {
            this.tileSet = new TileSet(defaultTexture, 16, 16);
        }
        
    }

    private async loadTexture(textureManager: any, tileType: number, path: string): Promise<void> {
        const texture = await textureManager.Load(`tile_${tileType}`, path);
        this.tileTextures.set(tileType, texture);
    }

    public getTileSet(): TileSet {
        if (!this.tileSet) {
            throw new Error("TileSet not initialized. Call loadAll() first.");
        }
        return this.tileSet;
    }

    public getTexture(tileType: number): Texture | undefined {
        return this.tileTextures.get(tileType);
    }
}