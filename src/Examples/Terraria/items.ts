import { ENTITY_TYPE } from "@/Scene/Entity";
import { isTreeNest, TilesType, TileType } from "./tiles";
import { Vector2, Vector3, Vector4 } from "@/Math/Vectors";
import { TileManager } from "./tileRendering";
import { EntityManager } from "@/Scene/EntityManager";
import { Input } from "@/Input/Inputs";
import { SPRITE_TYPE } from "@/Renderer/Renderer2D";
import { Color } from "@/Scene/Colors";

interface Tile {
    position: Vector2;
    size: Vector2;
    type: TileType;
    color: Vector4;
    spriteType: SPRITE_TYPE;
}


export class Items {
    private tiles: Tile[] = [];
    private selectedTiles: Set<Tile> = new Set();
    private input!: Input;

    constructor(private m_Renderer2D: any) {
    }

   SelectTile() {
        const mousePosition = this.input.GetMousePosition();

        const selectedTile = this.tiles.find(tile => this.isPointInsideTile(mousePosition, tile));
        if (selectedTile) {
            this.selectedTiles.add(selectedTile);
        }
    }

    public setInput(input: Input) {
    this.input = input;
    }
     private isPointInsideTile(point: Vector2, tile: Tile): boolean {
        return (
            point.x >= tile.position.x &&
            point.x <= tile.position.x + tile.size.x &&
            point.y >= tile.position.y &&
            point.y <= tile.position.y + tile.size.y
        );
    }

    private BoxItems() {
        const itemSize = new Vector3(100, 100,0); // Size of each item
        const padding = 10;

        for (let i = 0; i < 4; i++) {
            const position = new Vector3(padding + (i * (itemSize.x + padding)), 0);
            this.m_Renderer2D.DrawQuad(new Vector3(0,0,0), itemSize, Color.YELLOW, SPRITE_TYPE.DYNAMIC); // Assuming sprite name
        }
    }

    public draw(): void {
    const itemSize = new Vector3(100, 100, 0); // Size of each item
    const padding = 10;

    for (let i = 0; i < 4; i++) {
        const position = new Vector3(padding + (i * (itemSize.x + padding)), 0, 0);
        this.m_Renderer2D.DrawQuad(position, itemSize, Color.YELLOW, SPRITE_TYPE.DYNAMIC);
    }
}
        addTile(type: TileType) {
            const mousePosition = this.input.GetMousePosition();

            const tile: Tile = {
                position: new Vector2(mousePosition.x, mousePosition.y),
                size: new Vector2(32, 32),
                type,
                color: new Vector4(1, 1, 1, 1),
                spriteType: SPRITE_TYPE.DYNAMIC
            };

            this.tiles.push(tile);
        }

        // Remove tile
        removeTile(tile: Tile) {
            this.tiles = this.tiles.filter(t => t !== tile);
        }

        getTiles(): Tile[] {
            return this.tiles;
        }

        OnUpdate() {
        // Handle tile selection
        if (this.input.IsMousePressed(1)) {
            this.SelectTile();
        }

        // Render UI and tiles
        this.BoxItems();
    }

}