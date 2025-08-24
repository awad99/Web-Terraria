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


export class UI {
    private BackgroundId!: number;
    private LogoId!: number;
    private BackGroundsprite!: any;
    private BackgroundIPosition: Vector3 = new Vector3(0, 0, -5);
    private Background_SIZE = new Vector3(1920, 1080, 1);
    private Logo_Size = new Vector3(600, 200, 10);
    private LogoPosition: Vector3 = new Vector3(0, 300, -5);
    private LogoSprite!: any;
    private StartButtonPosition: Vector3 = new Vector3(0, 0, -4);
    private ButtonSettingsPosition: Vector3 = new Vector3(0, -200, -4);
    private ButtonSize: Vector3 = new Vector3(300, 100, 1);
    private isGameStarted: boolean = false;
    private focusedButton: "start" | "settings" = "start";
    private defaultButtonSize: Vector3 = new Vector3(300, 100, 1);
    private bigButtonSize: Vector3 = new Vector3(400, 140, 1);
    private lastInputState: boolean = false;

    constructor(
        private m_ResourceManager: any,
        private m_EntityManager: EntityManager,
        private m_Renderer2D: any,
    )
    {

    }
    public async ShowUi() {

        this.BackgroundId = this.m_EntityManager.AddEntity(ENTITY_TYPE.PLAYER);
        this.LogoId = this.m_EntityManager.AddEntity(ENTITY_TYPE.PLAYER);

        const textureManager = this.m_ResourceManager.GetHandler(HANDLER_TYPE.TEXTURE);

        const BackgroundTexture = await textureManager.Load("run", "/assets/textures/splash.png");
        const LogoTexture = await textureManager.Load("run", "/assets/textures/Logo.png");

        this.BackGroundsprite = this.m_EntityManager.AddComponent(this.BackgroundId, COMPONENT_TYPE.SPRITE);
        this.LogoSprite = this.m_EntityManager.AddComponent(this.LogoId, COMPONENT_TYPE.SPRITE);

        if (this.BackGroundsprite) {
            this.BackGroundsprite.Texture = BackgroundTexture;
            this.BackGroundsprite.Size = this.Background_SIZE;
            this.BackGroundsprite.Position = this.BackgroundIPosition;
        }

        if (this.LogoSprite) {
            this.LogoSprite.Texture = LogoTexture;
            this.LogoSprite.Size = this.Logo_Size;
            this.LogoSprite.Position = this.LogoPosition;
        }
    }


    public drawUI(): void {
        if (!this.BackGroundsprite || !this.LogoSprite) return;

        // If game started, skip drawing UI
        if (this.isGameStarted) return;

        const BackGroundposition = this.BackGroundsprite.Position;
        const BackGroundsize = this.BackGroundsprite.Size;
        const BackGroundcolor = new Vector4(1, 1, 1, 1);

        const LogoPosition = this.LogoSprite.Position;
        const LogoSize = this.LogoSprite.Size;
        const LogoColor = new Vector4(1, 1, 1, 1);

        this.m_Renderer2D.DrawSprite(
            BackGroundposition,
            BackGroundsize,
            BackGroundcolor,
            this.BackGroundsprite,
            SPRITE_TYPE.DYNAMIC
        );

        this.m_Renderer2D.DrawSprite(
            LogoPosition,
            LogoSize,
            LogoColor,
            this.LogoSprite,
            SPRITE_TYPE.DYNAMIC
        );

    // Draw "Start Game" button with dynamic size
    this.m_Renderer2D.DrawQuad(
        this.StartButtonPosition,
        this.getButtonSize("start"),
        Color.DARKGRAY,
        SPRITE_TYPE.STATIC
    );

    // Draw "Settings" button with dynamic size
    this.m_Renderer2D.DrawQuad(
        this.ButtonSettingsPosition,
        this.getButtonSize("settings"),
        Color.DARKGRAY,
        SPRITE_TYPE.STATIC
    );


    }

    public Update(input: any): void {
        const downPressed = input.IsKeyPressed("ArrowDown") || input.IsKeyPressed("KeyS");
        const upPressed = input.IsKeyPressed("ArrowUp") || input.IsKeyPressed("KeyW");

        // Trigger only on key down event (not held)
        const currentInputState = downPressed || upPressed;

        if (currentInputState && !this.lastInputState) {
            if (downPressed) {
                this.focusedButton = this.focusedButton === "start" ? "settings" : "start";
            } else if (upPressed) {
                this.focusedButton = this.focusedButton === "settings" ? "start" : "settings";
            }
        }

        this.lastInputState = currentInputState;
    }



    private isInsideButton(mouse: Vector2, pos: Vector3, size: Vector3): boolean {
        return (
            mouse.x >= pos.x - size.x / 2 &&
            mouse.x <= pos.x + size.x / 2 &&
            mouse.y >= pos.y - size.y / 2 &&
            mouse.y <= pos.y + size.y / 2
        );
    }

    public HandleClick(mousePos: Vector2): void {
        if (this.isGameStarted) return;

        if (this.isInsideButton(mousePos, this.StartButtonPosition, this.getButtonSize("start"))) {
            this.focusedButton = "settings"; // switch focus
        } else if (this.isInsideButton(mousePos, this.ButtonSettingsPosition, this.getButtonSize("settings"))) {
            this.focusedButton = "start"; // switch back
        }
    }

    private getButtonSize(button: "start" | "settings"): Vector3 {
    return this.focusedButton === button ? this.bigButtonSize : this.defaultButtonSize;
}

    private StartGame(IsGameStart: boolean) 
    {
        this.m_Renderer2D.DrawQuad(
        this.StartButtonPosition,
        this.ButtonSize,
        Color.DARKGRAY,
        SPRITE_TYPE.STATIC
        );


        if(IsGameStart)
            return true;
        else 
            return false;
    }
}