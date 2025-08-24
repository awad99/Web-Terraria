// Enhanced Physics System
import { Vector3, Vector4 } from "@/Math/Vectors";
import { TileType, TilesType, isNone } from "./tiles";
import { EntityManager } from "@/Scene/EntityManager";
import { COMPONENT_TYPE } from "@/Scene/Components";

export interface AABB {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export interface PhysicsComponent {
    velocity: Vector3;
    acceleration: Vector3;
    isGrounded: boolean;
    mass: number;
    friction: number;
    maxVelocity: Vector3;
    canCollide: boolean;
    groundCheckDistance: number; // For better ground detection
}

export class Physics {
    private static readonly GRAVITY = -1200; // Increased gravity for better feel
    private static readonly TERMINAL_VELOCITY = -1500;
    private static readonly GROUND_FRICTION = 0.85;
    private static readonly AIR_RESISTANCE = 0.98;
    private static readonly COLLISION_EPSILON = 0.1; // Small value to prevent floating point issues

    // Add physics component to entity
    public static AddPhysicsComponent(
        entityManager: EntityManager, 
        entityId: number,
        mass: number = 1.0,
        friction: number = 0.8
    ): PhysicsComponent {
        const physics: PhysicsComponent = {
            velocity: new Vector3(0, 0, 0),
            acceleration: new Vector3(0, 0, 0),
            isGrounded: false,
            mass,
            friction,
            maxVelocity: new Vector3(600, 1500, 0),
            canCollide: true,
            groundCheckDistance: 5
        };
        
        return physics;
    }

    // Apply gravity to entity
    public static ApplyGravity(physics: PhysicsComponent, deltaTime: number): void {
        if (!physics.isGrounded) {
            physics.velocity.y += Physics.GRAVITY * deltaTime;
            
            // Apply terminal velocity
            if (physics.velocity.y < Physics.TERMINAL_VELOCITY) {
                physics.velocity.y = Physics.TERMINAL_VELOCITY;
            }
        }
    }

    // Apply friction
    public static ApplyFriction(physics: PhysicsComponent, deltaTime: number): void {
        if (physics.isGrounded) {
            physics.velocity.x *= Physics.GROUND_FRICTION;
        } else {
            physics.velocity.x *= Physics.AIR_RESISTANCE;
            physics.velocity.y *= Physics.AIR_RESISTANCE;
        }
        
        // Stop very small movements to prevent jitter
        if (Math.abs(physics.velocity.x) < 5) {
            physics.velocity.x = 0;
        }
    }

    // Update entity position based on physics
    public static UpdatePosition(
        position: Vector3, 
        physics: PhysicsComponent, 
        deltaTime: number
    ): Vector3 {
        // Apply velocity limits
        physics.velocity.x = Math.max(-physics.maxVelocity.x, 
                            Math.min(physics.maxVelocity.x, physics.velocity.x));
        physics.velocity.y = Math.max(-physics.maxVelocity.y, 
                            Math.min(physics.maxVelocity.y, physics.velocity.y));

        // Update position
        const newPosition = new Vector3(
            position.x + physics.velocity.x * deltaTime,
            position.y + physics.velocity.y * deltaTime,
            position.z
        );

        return newPosition;
    }

    // Get AABB from position and size
    public static GetAABB(position: Vector3, size: Vector3): AABB {
        return {
            minX: position.x,
            maxX: position.x + size.x,
            minY: position.y,
            maxY: position.y + size.y
        };
    }

    // Check AABB collision
    public static CheckAABBCollision(aabb1: AABB, aabb2: AABB): boolean {
        return (
            aabb1.minX < aabb2.maxX &&
            aabb1.maxX > aabb2.minX &&
            aabb1.minY < aabb2.maxY &&
            aabb1.maxY > aabb2.minY
        );
    }

    // Improved collision resolution with better ground detection
    public static ResolveTileCollision(
        entityPos: Vector3,
        entitySize: Vector3,
        physics: PhysicsComponent,
        tilePos: Vector3,
        tileSize: Vector3,
        tileType: TileType
    ): Vector3 {
        if (isNone(tileType)) return entityPos;

        const entityAABB = Physics.GetAABB(entityPos, entitySize);
        const tileAABB = Physics.GetAABB(tilePos, tileSize);

        if (!Physics.CheckAABBCollision(entityAABB, tileAABB)) {
            return entityPos;
        }

        // Calculate overlap amounts with epsilon for floating point precision
        const overlapLeft = (entityAABB.maxX - tileAABB.minX) + Physics.COLLISION_EPSILON;
        const overlapRight = (tileAABB.maxX - entityAABB.minX) + Physics.COLLISION_EPSILON;
        const overlapTop = (entityAABB.maxY - tileAABB.minY) + Physics.COLLISION_EPSILON;
        const overlapBottom = (tileAABB.maxY - entityAABB.minY) + Physics.COLLISION_EPSILON;

        // Find minimum overlap (closest surface)
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        let newPos = new Vector3(entityPos.x, entityPos.y, entityPos.z);

        // Resolve collision based on minimum overlap direction
        if (minOverlap === overlapTop && physics.velocity.y >= 0) {
            // Collision from bottom (entity moving up into ceiling)
            newPos.y = tileAABB.minY - entitySize.y - Physics.COLLISION_EPSILON;
            physics.velocity.y = Math.min(physics.velocity.y, 0); // Stop upward movement
        } 
        else if (minOverlap === overlapBottom && physics.velocity.y <= 0) {
            // Collision from top (entity falling down onto ground)
            newPos.y = tileAABB.maxY + Physics.COLLISION_EPSILON;
            physics.velocity.y = Math.max(physics.velocity.y, 0); // Stop downward movement
            physics.isGrounded = true;
            console.debug("Player grounded!"); // Debug log
        } 
        else if (minOverlap === overlapLeft && physics.velocity.x >= 0) {
            // Collision from left (entity moving right into wall)
            newPos.x = tileAABB.minX - entitySize.x - Physics.COLLISION_EPSILON;
            physics.velocity.x = Math.min(physics.velocity.x, 0);
        } 
        else if (minOverlap === overlapRight && physics.velocity.x <= 0) {
            // Collision from right (entity moving left into wall)
            newPos.x = tileAABB.maxX + Physics.COLLISION_EPSILON;
            physics.velocity.x = Math.max(physics.velocity.x, 0);
        }

        return newPos;
    }

    // Additional helper method to check if entity should be grounded
    public static CheckGroundBelow(
        entityPos: Vector3,
        entitySize: Vector3,
        tileEntities: any[],
        entityManager: any,
        groundCheckDistance: number = 5
    ): boolean {
        // Create a small AABB below the entity to check for ground
        const checkAABB: AABB = {
            minX: entityPos.x + 2, // Slightly inset to avoid edge cases
            maxX: entityPos.x + entitySize.x - 2,
            minY: entityPos.y - groundCheckDistance,
            maxY: entityPos.y
        };

        for (const tileId of tileEntities) {
            const tileSprite = entityManager.GetComponent(tileId, COMPONENT_TYPE.SPRITE);
            if (!tileSprite) continue;

            const tileAABB = Physics.GetAABB(tileSprite.Position, new Vector3(22, 22, 1));
            
            if (Physics.CheckAABBCollision(checkAABB, tileAABB)) {
                return true;
            }
        }

        return false;
    }
}