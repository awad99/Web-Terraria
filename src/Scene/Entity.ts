import { Vector3 } from "@/Math/Vectors";
import { Texture } from "@/Renderer/Texture";
import { TilesType } from "@/Examples/Terraria/tiles";

export enum ENTITY_TYPE
{
    ENEMY, PLAYER,TILE
}

export class Tiles
{
    public ID!: number;
    public frame: Texture | null = null;
    public Position1: Vector3 = new Vector3(0, 0, 0);
    public Size1: Vector3 = new Vector3(70, 70, 1);

    constructor(id: number, frame: Texture | null = null)
    {
        this.ID = id;
        this.frame = frame;
    }

    public GetTileType(): typeof TilesType {
        switch (this.ID) {
            case 1: TilesType.GRASS;
            case 2: TilesType.DIRT;
            case 3: TilesType.STONE;
            case 4: TilesType.Gold;
            case 5: TilesType.Silver;
            default: throw new Error("Unknown tile type");
        }
    }
}

export class Entity 
{
    public Type: ENTITY_TYPE;
    public ID!: number;
    public ComponentMask: number;

    
    constructor(entityType: ENTITY_TYPE, id: number)
    {
        this.Type = entityType;
        this.ID = id;
        this.ComponentMask = 0;
    }
    
    public HasComponents(mask: number): boolean
    {
        return (this.ComponentMask & mask) === mask; 
    }
    public HasSpecComponent(indivualComponent: number)
    {
        return (this.ComponentMask & indivualComponent) !== 0;
    }
    
}