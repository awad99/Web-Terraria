import { Vector3, Vector4 } from "@/Math/Vectors";
import { Animation, AnimationManager, CreateAnimationClip } from "@/Animation/Animation";
import { EntityManager } from "@/Scene/EntityManager";
import { ENTITY_TYPE } from "@/Scene/Entity";
import { COMPONENT_TYPE } from "@/Scene/Components";
import { HANDLER_TYPE, ResourceManager } from "@/ResourceManagement/ResourceManager";
import { SPRITE_TYPE } from "@/Renderer/Renderer2D";
import { Physics, PhysicsComponent } from "./phisics";
import { TilesType, TileType } from "./tiles";

export class PhysicsPlayer {
    private playerEntityId!: number;
    private sprite!: any;
    private runAnimation!: any;
    private physics!: PhysicsComponent;
    public playerPosition: Vector3 = new Vector3(0, 200, -5);
    public PLAYER_SIZE = new Vector3(50, 50, 1);
    private m_Camera2D: any;
    private isMoving: boolean = false;
    private jumpForce: number = 800; // Increased jump force
    private moveSpeed: number = 300;
    private wasGrounded: boolean = false; // Track previous grounded state

    constructor(
        private m_EntityManager: EntityManager,
        private m_ResourceManager: any,
        private m_Renderer2D: any,
        private m_AnimationManager: any,
        camera2D: any
    ) {
        this.m_Camera2D = camera2D;
    }

    public async Init(): Promise<void> {
        this.playerEntityId = this.m_EntityManager.AddEntity(ENTITY_TYPE.PLAYER);
        
        // Then initialize physics
        this.physics = Physics.AddPhysicsComponent(this.m_EntityManager, this.playerEntityId, 1.0, 0.8);
        
        const textureManager = this.m_ResourceManager.GetHandler(HANDLER_TYPE.TEXTURE);
        const playerTexture = await textureManager.Load("run", "/assets/textures/Player/Player.png");

        this.sprite = this.m_EntityManager.AddComponent(this.playerEntityId, COMPONENT_TYPE.SPRITE);
        const animationComponent = this.m_EntityManager.AddComponent(this.playerEntityId, COMPONENT_TYPE.ANIMATION);

        if (this.sprite) {
            this.sprite.Texture = playerTexture;
            this.sprite.Size = this.PLAYER_SIZE;
            this.sprite.Position = this.playerPosition; // Use initial position
        }

        this.runAnimation = CreateAnimationClip(
            "Run",
            playerTexture,
            26,            
            64, 64,     
            0.01,
            64, 64 * 26,
            false,
        );

        animationComponent.Animations.set(this.runAnimation.m_Name, this.runAnimation);
        animationComponent.ActiveClip = this.runAnimation.m_Name;
    }

    public Update(deltaTime: number, input: any, tileEntities: number[], tileManager: any): void {
        // Store previous grounded state
        this.wasGrounded = this.physics.isGrounded;
        
        // Reset grounded state at start of frame
        this.physics.isGrounded = false;

        // Handle input
        this.handleInput(input, deltaTime);

        // Apply physics
        Physics.ApplyGravity(this.physics, deltaTime);
        Physics.ApplyFriction(this.physics, deltaTime);

        // Calculate new position
        let newPosition = Physics.UpdatePosition(this.playerPosition, this.physics, deltaTime);

        // Check collisions with tiles
        newPosition = this.checkTileCollisions(newPosition, tileEntities, tileManager);

        // Update position
        this.playerPosition = newPosition;

        if (this.sprite) {
            this.sprite.Position = this.playerPosition;
        }

        this.animatePlayer(deltaTime);
    }

    private handleInput(input: any, deltaTime: number): void {
        const moveForce = this.moveSpeed;
        this.isMoving = false;

        if (input.IsKeyPressed("KeyA")) {
            this.physics.velocity.x = -moveForce;
            this.isMoving = true;

            if (this.sprite) {
                this.sprite.FlipX = false; 
            }
        } else if (input.IsKeyPressed("KeyD")) {
            this.physics.velocity.x = moveForce;
            this.isMoving = true;

            if (this.sprite) {
                this.sprite.FlipX = true;
            }
        } else {
            // Deceleration
            this.physics.velocity.x *= 0.85;
            if (Math.abs(this.physics.velocity.x) < 10) {
                this.physics.velocity.x = 0;
            }
        }

        // Jump logic
        if ((input.IsKeyPressed("KeyW") || input.IsKeyPressed("Space"))) {
            if (this.physics.isGrounded || this.wasGrounded) {
                this.physics.velocity.y = this.jumpForce;
                this.physics.isGrounded = false;
                console.log("Jump executed!");
            }
        }
    }


    private checkTileCollisions(newPosition: Vector3, tileEntities: number[], tileManager: any): Vector3 {
        let resolvedPosition = new Vector3(newPosition.x, newPosition.y, newPosition.z);

        for (const entityId of tileEntities) {
            const tileSprite = this.m_EntityManager.GetComponent(entityId, COMPONENT_TYPE.SPRITE);
            if (!tileSprite) continue;

            // Get tile type from your tile manager
            const tileType = this.getTileTypeFromSprite(tileSprite, tileManager);
            
            resolvedPosition = Physics.ResolveTileCollision(
                resolvedPosition,
                this.PLAYER_SIZE,
                this.physics,
                tileSprite.Position,
                new Vector3(22, 22, 1), 
                tileType
            );
        }

        return resolvedPosition;
    }

    private getTileTypeFromSprite(sprite: any, tileManager: any): TileType {
        // Match sprite texture to tile type
        if (sprite.Texture === tileManager.getTexture(TilesType.GRASS)) return TilesType.GRASS;
        if (sprite.Texture === tileManager.getTexture(TilesType.DIRT)) return TilesType.DIRT;
        if (sprite.Texture === tileManager.getTexture(TilesType.STONE)) return TilesType.STONE;
        if (sprite.Texture === tileManager.getTexture(TilesType.Silver)) return TilesType.Silver;
        if (sprite.Texture === tileManager.getTexture(TilesType.Gold)) return TilesType.Gold;
        if (sprite.Texture === tileManager.getTexture(TilesType.TreeNest)) return TilesType.TreeNest;
        if (sprite.Texture === tileManager.getTexture(TilesType.TreeBranch)) return TilesType.TreeBranch;
        return TilesType.None;
    }

    public ApplyForce(force: Vector3): void {
        this.physics.velocity.x += force.x;
        this.physics.velocity.y += force.y;
    }


    public CanJump(): boolean {
        return this.physics.isGrounded || this.wasGrounded;
    }

    // Get player velocity for other systems
    public GetVelocity(): Vector3 {
        return this.physics.velocity;
    }

    // Get player position for camera following
    public GetPosition(): Vector3 {
        return this.playerPosition;
    }

    public drawPlayer(): void {
        if (!this.sprite) return;

        const position = this.sprite.Position;
        const size = this.sprite.Size;
        const color = new Vector4(1, 1, 1, 1);

        this.m_Renderer2D.DrawSprite(
            position,
            size,
            color,
            this.sprite,
            SPRITE_TYPE.DYNAMIC
        );
    }

    private animatePlayer(deltaTime: number): void {
        const anim = this.m_EntityManager.GetComponent(this.playerEntityId, COMPONENT_TYPE.ANIMATION);

        if (!anim || !this.sprite) return;

        if (this.isMoving) {
            this.SetAnimationClip("Run");
        } else if (this.runAnimation) {
            this.SetAnimationClip("Run"); // fallback
        }

        const currentClip = anim.Animations.get(anim.ActiveClip);
        if (currentClip) {
            this.m_AnimationManager.Update(currentClip, this.sprite, deltaTime);
        }
    }

    private SetAnimationClip(name: string): void {
        const anim = this.m_EntityManager.GetComponent(this.playerEntityId, COMPONENT_TYPE.ANIMATION);
        if (anim && anim.ActiveClip !== name) {
            anim.ActiveClip = name;
            const clip = anim.Animations.get(name);
            if (clip) {
                clip.m_CurrentFrame = 0;
                clip.m_ElapsedTime = 0;
            }
        }
    }
}