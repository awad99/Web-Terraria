import { Application } from "@/Core/Application";
import { Vector2, Vector3, Vector4 } from "@/Math/Vectors";
import { Animation, AnimationManager, CreateAnimationClip } from "@/Animation/Animation";
import { EntityManager } from "@/Scene/EntityManager";
import { ENTITY_TYPE } from "@/Scene/Entity";
import { COMPONENT_TYPE, CSprite } from "@/Scene/Components";
import { HANDLER_TYPE, ResourceManager } from "@/ResourceManagement/ResourceManager";
import { SPRITE_TYPE } from "@/Renderer/Renderer2D";
import { Color } from "@/Scene/Colors";
import { TileSet } from "@/Examples/Terraria/tilesSet";
import { TilesType } from "@/Examples/Terraria/tiles";
import { TileManager } from "./tileRendering";
import { Map } from "@/Examples/Terraria/Map";
import { PhysicsPlayer } from "./player";
import { PhysicsComponent } from "./phisics";
import {Items} from "./items";
import { Input } from "@/Input/Inputs";
import { Matrix4 } from "@/Math/Matrices";
import { UI } from "./Ui";

export type TileType = (typeof TilesType)[keyof typeof TilesType];

interface Tile {
    position: Vector2;
    size: Vector2;
    type: TileType;
    color: Vector4;
    spriteType: SPRITE_TYPE;
}


export class Testgame2 extends Application {
    private map!: Map;
    private tileManager!: TileManager;
    private physics!: PhysicsComponent;
    private items!: Items;
    private tileSet!: TileSet;
    private tiles: TileType[][] = [];
    private player!: PhysicsPlayer;
    private tileEntities: number[] = []; 
    private tilePosition: Vector3 = new Vector3(0, 200, -10);
    private PlayerSize = new Vector3(100, 100, 3);
    private TileSize = new Vector3(22, 22, 1);
    private playerspeed: number = 200;
    private m_EntityManager!: EntityManager;
    private m_AnimationManager!: AnimationManager;
    private debugSprite: CSprite | null = null; 
    private baseWidth: number = 1920;
    private baseHeight: number = 1280;
    private moveSpeed: number = 300;
    private ItemsEntity!: number;
    private spriteItems!: CSprite;
    private ui!: UI;

    // Camera following variables
    private cameraOffset: Vector3 = new Vector3(0, -100, -1); // Offset from player
    private cameraLerpSpeed: number = 5.0; // How quickly camera follows
    private renderBuffer: number = 100; // Extra buffer for culling
    private Items_SIZE = new Vector3(50, 50, 1);


    protected async OnInit(): Promise<void> {
        this.m_Camera2D.SetPosition(new Vector3(0, 0, -1));

        this.m_EntityManager = new EntityManager();
        this.m_AnimationManager = new AnimationManager();

        const textureManager = this.m_ResourceManager.GetHandler(HANDLER_TYPE.TEXTURE);

        const ItemsTexture = await textureManager.Load("run", "/assets/textures/Items/Item_1.png");

        this.ItemsEntity = this.m_EntityManager.AddEntity(ENTITY_TYPE.PLAYER);

        this.spriteItems = this.m_EntityManager.AddComponent(this.ItemsEntity, COMPONENT_TYPE.SPRITE);
        const animationComponent = this.m_EntityManager.AddComponent(this.ItemsEntity, COMPONENT_TYPE.ANIMATION);

        if (this.spriteItems) {
            this.spriteItems.Texture = ItemsTexture;
            this.spriteItems.Size = this.Items_SIZE;
            this.spriteItems.Position = new Vector3(300, 300, 0);
        }

        this.player = new PhysicsPlayer(
            this.m_EntityManager,
            this.m_ResourceManager,
            this.m_Renderer2D,
            this.m_AnimationManager,
            this.m_Camera2D,
        );

        this.ui = new UI(
            this.m_ResourceManager,
            this.m_EntityManager,
            this.m_Renderer2D
        );

        await this.ui.ShowUi();

        await this.player.Init();
        this.items = new Items(this.m_Renderer2D);
        this.items.setInput(this.m_Input);
        this.tileManager = new TileManager(this.m_ResourceManager);
        await this.tileManager.loadAll();

        // Initialize the map
        this.map = new Map(this.m_EntityManager, this.tileManager);
        await this.map.createTileMap(new Vector3(-900, -1000, -10));
        
        this.tileEntities = this.map.tileEntities;
    }

    private updateCamera(deltaTime: number): void {
        const playerPos = this.player.GetPosition();
        const currentCamPos = this.m_Camera2D.GetPosition();
        
        // Calculate target camera position
        const targetPos = new Vector3(
            playerPos.x + this.cameraOffset.x,
            playerPos.y + this.cameraOffset.y,
            this.cameraOffset.z
        );
        
        // Smoothly lerp camera to target position
        const newCamPos = new Vector3(
            this.lerp(currentCamPos.x, targetPos.x, this.cameraLerpSpeed * deltaTime),
            this.lerp(currentCamPos.y, targetPos.y, this.cameraLerpSpeed * deltaTime),
            targetPos.z
        );
        
        this.m_Camera2D.SetPosition(newCamPos);
    }

    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * Math.min(t, 1);
    }
    
    private getVisibleBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
        const camPos = this.m_Camera2D.GetPosition();
        const halfW = (this.baseWidth * 0.5) + this.renderBuffer;
        const halfH = (this.baseHeight * 0.5) + this.renderBuffer;

        return {
            minX: camPos.x - halfW,
            maxX: camPos.x + halfW,
            minY: camPos.y - halfH,
            maxY: camPos.y + halfH
        };
    }

    private isInViewport(pos: Vector3, size: Vector3, bounds: any): boolean {
        return !(pos.x + size.x < bounds.minX || 
                pos.x > bounds.maxX ||
                pos.y + size.y < bounds.minY || 
                pos.y > bounds.maxY);
    }

    protected OnRender(): void {
        const input = new Input();

        this.m_Renderer2D.BeginScene(this.m_Camera2D);

       
        const bounds = this.getVisibleBounds();
        let tilesRendered = 0;
      //  this.ui.drawUI();
          this.m_Renderer2D.SetClearColor(Color.SKYBLUE);
        for (const entity of this.tileEntities) {
            const tileSprite = this.m_EntityManager.GetComponent(entity, COMPONENT_TYPE.SPRITE);
            if (!tileSprite) continue;

            const pos = tileSprite.Position;
            
            // Skip if tile is not visible
            if (!this.isInViewport(pos, this.TileSize, bounds)) {
                continue;
            }

            tilesRendered++;

            // Determine tile size based on type
            let renderSize = new Vector3(this.TileSize.x + 2, this.TileSize.y + 2, this.TileSize.z);
            
            if (tileSprite.Texture === this.tileManager.getTexture(TilesType.TreeNest)) {
                renderSize = new Vector3(this.TileSize.x + 45, this.TileSize.y + 45, this.TileSize.z);
            }

            this.m_Renderer2D.DrawSprite(
                pos,
                renderSize,
                new Vector4(1, 1, 1, 1),
                tileSprite,
                SPRITE_TYPE.DYNAMIC
            );
        }


        const mousePos = input.GetMousePosition(); 
        this.m_Renderer2D.DrawQuad(
            new Vector3(mousePos.x, mousePos.y, 1),
            new Vector3(400, 400, 0),
            new Vector4(1, 0, 0, 1),
            SPRITE_TYPE.STATIC
        );
      //  this.player?.drawPlayer();
        this.m_Renderer2D.EndScene();

    }


    private getMouseWorldPosition(): Vector3 {
        const input = new Input();
        const mousePos = input.GetMousePosition(); // screen space
        const camPos = this.m_Camera2D.GetPosition(); // world space

        const halfW = this.baseWidth / 2;
        const halfH = this.baseHeight / 2;

        return new Vector3(
            camPos.x + (mousePos.x - halfW),
            camPos.y + (mousePos.y - halfH),
            -0 // z = 0
        );
    }


    private ItemsInBox(){
        const itemsSprite = this.m_EntityManager.GetComponent(this.ItemsEntity, COMPONENT_TYPE.SPRITE);
        if (!itemsSprite) return;

        const padding = 20; 
        const startX = -900; // X position
        const startY = 420; // Y position
        const zIndex = -10; // Z position

        const pos = new Vector3(startX, startY, zIndex);
        let renderSize = new Vector3(this.TileSize.x + 2, this.TileSize.y + 2, this.TileSize.z);

            this.m_Renderer2D.DrawSprite(
                pos,
                this.Items_SIZE,
                new Vector4(1, 1, 1, 1),
                itemsSprite,
                SPRITE_TYPE.DYNAMIC
            );
    }


    public BoxItems() {
        const padding = 20; 
        const startX = -900; // Starting X position
        const startY = 420; // Y position
        const zIndex = -10; // Z position
        for (let i = 0; i < 4; i++) {

               const xPos = startX + (i * (new Vector3(70, 70, 0).x + padding));

            this.m_Renderer2D.DrawQuad(
                new Vector3(xPos, startY, zIndex),
                new Vector3(70, 70, 0),
                Color.BLACK,
                SPRITE_TYPE.STATIC
            );
        }

    }


private drawMouseWorldSquare(): void {

    // const camPos = this.m_Camera2D.GetPosition();

    // Convert mouse screen coordinates to world coordinates
    // const mouseWorld = new Vector3(
    //     camPos.x + (mousePos.x - this.baseWidth / 2),
    //     camPos.y + (mousePos.y - this.baseHeight / 2),
    //     0 // Z layer for drawing
    // );

    const size = new Vector3(20, 20, 0); // size of the square

    // // Draw a red square centered on the mouse position
    // this.m_Renderer2D.DrawQuad(
    //     new Vector3(mouseWorld.x - size.x / 2, mouseWorld.y - size.y / 2, mouseWorld.z + 1),
    //     size,
    //     new Vector4(1, 0, 0, 1), // red color
    //     SPRITE_TYPE.STATIC
    // );
}





public getTileType(x: number, y: number): TileType {
    return this.tiles[y]?.[x] ?? TilesType.None;
}



    protected OnUpdate(deltaTime: number): void {
        // Update player physics and movement
        this.player?.Update(deltaTime, this.m_Input, this.tileEntities, this.tileManager);
        
        // Update camera to follow player
        this.updateCamera(deltaTime);
       
        // Optional: Handle other game updates here
        // this.updateGameSystems(deltaTime);
    }

    private updateGameSystems(deltaTime: number): void {
        // Add any other game systems here like:
        // - Enemy AI updates
        // - Particle systems
        // - Sound management
        // - UI updates
    }

    // Optional: Add debug methods
    public getDebugInfo(): any {
        const playerPos = this.player?.GetPosition();
        const cameraPos = this.m_Camera2D.GetPosition();
        const bounds = this.getVisibleBounds();
        
        return {
            playerPosition: playerPos,
            cameraPosition: cameraPos,
            visibleBounds: bounds,
            totalTiles: this.tileEntities.length
        };
    }
}