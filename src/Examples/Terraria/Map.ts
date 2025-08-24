import { ENTITY_TYPE } from "@/Scene/Entity";
import { isTreeNest, TilesType, TileType } from "./tiles";
import { COMPONENT_TYPE, CSprite } from "@/Scene/Components";
import { Vector2, Vector3, Vector4 } from "@/Math/Vectors";
import { TileManager } from "./tileRendering";
import { EntityManager } from "@/Scene/EntityManager";
import { TileSet } from "./tilesSet";
import { Texture } from "@/Renderer/Texture";

enum TileDirtType {
    CORNER_TOP_LEFT = 0,
    EDGE_TOP = 1,
    CORNER_TOP_RIGHT = 2,
    EDGE_LEFT = 3,
    CENTER = 4,
    EDGE_RIGHT = 5,
    CORNER_BOTTOM_LEFT = 6,
    CORNER_BOTTOM_RIGHT = 8
}

enum TileGrassType {
    CORNER_TOP_LEFT = 0,
    EDGE_TOP = 1,
    CORNER_TOP_RIGHT = 2,
    EDGE_LEFT = 3,
    CENTER = 4,
    EDGE_RIGHT = 5,
    CORNER_BOTTOM_LEFT = 6,
    CORNER_BOTTOM_RIGHT = 7
}

enum TileStoneType {
    CORNER_TOP_LEFT = 0,
    EDGE_TOP = 1,
    CORNER_TOP_RIGHT = 2,
    EDGE_LEFT = 3,
    CENTER = 4,
    EDGE_RIGHT = 5,
    CORNER_BOTTOM_LEFT = 6,
    CORNER_BOTTOM_RIGHT = 8
}

enum TileSilverType {
    CORNER_TOP_LEFT = 0,
    EDGE_TOP = 1,
    CORNER_TOP_RIGHT = 2,
    EDGE_LEFT = 3,
    CENTER = 4,
    EDGE_RIGHT = 5,
    CORNER_BOTTOM_LEFT = 6,
    CORNER_BOTTOM_RIGHT = 7
}

enum TileGoldType {
    CORNER_TOP_LEFT = 0,
    EDGE_TOP = 1,
    CORNER_TOP_RIGHT = 2,
    EDGE_LEFT = 3,
    CENTER = 4,
    EDGE_RIGHT = 5,
    CORNER_BOTTOM_LEFT = 6,
    CORNER_BOTTOM_RIGHT = 7
}

enum TileTreebarnchType {
    CORNER_TOP_LEFT = 0,
    EDGE_TOP = 1,
    CORNER_TOP_RIGHT = 2,
    EDGE_LEFT = 3,
    CENTER = 4,
    EDGE_RIGHT = 5,
    CORNER_BOTTOM_LEFT = 6,
    CORNER_BOTTOM_RIGHT = 7
}

enum TileTreeNestType {
    CORNER_TOP_LEFT = 0,
    EDGE_TOP = 1,
    CORNER_TOP_RIGHT = 2,
    EDGE_LEFT = 3,
    CENTER = 4,
    EDGE_RIGHT = 5,
    CORNER_BOTTOM_LEFT = 6,
    CORNER_BOTTOM_RIGHT = 7
}

export class Map {
    public tileEntities: number[] = [];
    private caveMap: boolean[][] = []; 
    private noiseMap: number[][] = [];
    private oreMap: ('none' | 'silver' | 'gold')[][] = [];

    // Pre-computed lookup tables for better performance
    private static readonly DIRT_COORDS: Record<TileDirtType, [number, number]> = {
        [TileDirtType.CORNER_TOP_LEFT]: [2, 4],
        [TileDirtType.EDGE_TOP]: [1, 1],
        [TileDirtType.CORNER_TOP_RIGHT]: [1, 4],
        [TileDirtType.EDGE_LEFT]: [0, 0],
        [TileDirtType.CENTER]: [2, 1],
        [TileDirtType.EDGE_RIGHT]: [4, 0],
        [TileDirtType.CORNER_BOTTOM_LEFT]: [1, 1],
        [TileDirtType.CORNER_BOTTOM_RIGHT]: [4, 0]
    };

    private static readonly Stone_COORDS: Record<TileStoneType, [number, number]> = {
        [TileStoneType.CORNER_TOP_LEFT]: [2, 4],
        [TileStoneType.EDGE_TOP]: [1, 1],
        [TileStoneType.CORNER_TOP_RIGHT]: [1, 4],
        [TileStoneType.EDGE_LEFT]: [0, 0],
        [TileStoneType.CENTER]: [2, 1],
        [TileStoneType.EDGE_RIGHT]: [4, 0],
        [TileStoneType.CORNER_BOTTOM_LEFT]: [1, 1],
        [TileStoneType.CORNER_BOTTOM_RIGHT]: [4, 0]
    };

    private static readonly Silver_COORDS: Record<TileSilverType, [number, number]> = {
        [TileSilverType.CORNER_TOP_LEFT]: [2, 4],
        [TileSilverType.EDGE_TOP]: [1, 1],
        [TileSilverType.CORNER_TOP_RIGHT]: [1, 4],
        [TileSilverType.EDGE_LEFT]: [0, 0],
        [TileSilverType.CENTER]: [2, 1],
        [TileSilverType.EDGE_RIGHT]: [4, 0],
        [TileSilverType.CORNER_BOTTOM_LEFT]: [1, 1],
        [TileSilverType.CORNER_BOTTOM_RIGHT]: [4, 0]
    };

    private static readonly Gold_COORDS: Record<TileGoldType, [number, number]> = {
        [TileGoldType.CORNER_TOP_LEFT]: [2, 4],
        [TileGoldType.EDGE_TOP]: [1, 1],
        [TileGoldType.CORNER_TOP_RIGHT]: [1, 4],
        [TileGoldType.EDGE_LEFT]: [0, 0],
        [TileGoldType.CENTER]: [2, 1],
        [TileGoldType.EDGE_RIGHT]: [4, 0],
        [TileGoldType.CORNER_BOTTOM_LEFT]: [1, 1],
        [TileGoldType.CORNER_BOTTOM_RIGHT]: [4, 0]
    };
    
    private static readonly DIRT_MOUNTAIN_COORDS: Record<TileDirtType, [number, number]> = {
        [TileDirtType.CORNER_TOP_LEFT]: [0, 0],
        [TileDirtType.EDGE_TOP]: [1, 0],
        [TileDirtType.CORNER_TOP_RIGHT]: [2, 0],
        [TileDirtType.EDGE_LEFT]: [0, 1],
        [TileDirtType.EDGE_RIGHT]: [2, 1],
        [TileDirtType.CENTER]: [1, 1],
        [TileDirtType.CORNER_BOTTOM_LEFT]: [0, 2],
        [TileDirtType.CORNER_BOTTOM_RIGHT]: [2, 2]
    };

    private static readonly GRASS_COORDS: Record<TileGrassType, [number, number]> = {
        [TileGrassType.CORNER_TOP_LEFT]: [2, 3],
        [TileGrassType.EDGE_TOP]: [1, 1],
        [TileGrassType.CORNER_TOP_RIGHT]: [1, 3],
        [TileGrassType.EDGE_LEFT]: [0, 1],
        [TileGrassType.CENTER]: [1, 1],
        [TileGrassType.EDGE_RIGHT]: [4, 0],
        [TileGrassType.CORNER_BOTTOM_LEFT]: [0, 1],
        [TileGrassType.CORNER_BOTTOM_RIGHT]: [4, 0]
    };

    private static readonly GRASS_MOUNTAIN_OPTIONS = {
        left: [[0, 3], [0, 3], [0, 3], [0, 3], [0, 3], [0, 3], [0, 3], [0, 3]] as [number, number][],
        right: [[1, 3], [1, 3], [1, 3], [1, 3], [1, 3], [1, 3], [1, 3], [1, 3]] as [number, number][],
        center: [[0, 3], [0, 3], [0, 3], [0, 3]] as [number, number][]
    };

        private static readonly Tree_barench_COORDS: Record<TileStoneType, [number, number]> = {
        [TileStoneType.CORNER_TOP_LEFT]: [2, 4],
        [TileStoneType.EDGE_TOP]: [1, 1],
        [TileStoneType.CORNER_TOP_RIGHT]: [1, 4],
        [TileStoneType.EDGE_LEFT]: [0, 0],
        [TileStoneType.CENTER]: [2, 1],
        [TileStoneType.EDGE_RIGHT]: [4, 0],
        [TileStoneType.CORNER_BOTTOM_LEFT]: [1, 1],
        [TileStoneType.CORNER_BOTTOM_RIGHT]: [4, 0]
    };

        private static readonly Tree_nest_COORDS: Record<TileStoneType, [number, number]> = {
        [TileStoneType.CORNER_TOP_LEFT]: [2, 4],
        [TileStoneType.EDGE_TOP]: [1, 1],
        [TileStoneType.CORNER_TOP_RIGHT]: [1, 4],
        [TileStoneType.EDGE_LEFT]: [0, 0],
        [TileStoneType.CENTER]: [2, 1],
        [TileStoneType.EDGE_RIGHT]: [4, 0],
        [TileStoneType.CORNER_BOTTOM_LEFT]: [1, 1],
        [TileStoneType.CORNER_BOTTOM_RIGHT]: [4, 0]
    };

    // Constants for better performance
    private static readonly TILE_SIZE = 20;
    private static readonly MOUNTAIN_COUNT = 10;
    private static readonly MOUNTAIN_SPACING = 2000;
    private static readonly MOUNTAIN_DOWN_SPACING = 2000;
    private static readonly EARTH_MOUNTAIN_SPACING = 4000;

    constructor(
        private entityManager: EntityManager,
        private tileManager: TileManager
    ) {}

     public async createTileMap(position: Vector3): Promise<void> {
        const [dirtTexture, grassTexture, stoneTexture, silverTexture, goldTexture, TreeNestTexture, TreeBranchTexture] = this.getTextures();
        if (!dirtTexture || !grassTexture || !stoneTexture || !silverTexture || !goldTexture || !TreeNestTexture || !TreeBranchTexture) {
            console.error("Textures not loaded!");
            return;
        }

        const dirtTileSet = new TileSet(dirtTexture, 16, 16);
        const grassTileSet = new TileSet(grassTexture, 16, 16);
        const stoneTileSet = new TileSet(stoneTexture, 16, 16);
        const silverTileSet = new TileSet(silverTexture, 16, 16);
        const goldTileSet = new TileSet(goldTexture, 16, 16);
        const TreeNestTileSet = new TileSet(TreeNestTexture, 16, 16);
        const TreeBranchTileSet = new TileSet(TreeBranchTexture, 16, 16);


        // Draw earth layer first
        this.drawEarthTiles(60, 600, dirtTexture, grassTexture, grassTileSet, dirtTileSet, position, Map.TILE_SIZE, Map.TILE_SIZE);

        // Draw stone layer BELOW the earth layer
        const stonePosition = new Vector3(position.x, position.y - 200 * Map.TILE_SIZE, position.z);
        this.drawUnderTheEarthTiles(200, 600, stoneTexture,stoneTileSet, silverTexture,silverTileSet, goldTexture,goldTileSet,stonePosition, Map.TILE_SIZE, Map.TILE_SIZE);


        this.initializeCaveMap(600, 260);
    //    this.initializeOreMap(600, 260);
        this.generateCaveSystem(600, 260, grassTileSet, grassTexture);
        
     //   this.generateOresAroundCaves(600, 260);

        // Draw earth layer with ores
     //   this.drawEarthTilesWithOres(60, 600, dirtTexture, grassTexture, silverTexture, goldTexture, 
       //     dirtTileSet, grassTileSet, silverTileSet, goldTileSet, position, Map.TILE_SIZE, Map.TILE_SIZE);

        // Draw stone layer with ores
    
   //     this.drawUnderTheEarthTilesWithOres(200, 600, stoneTexture, silverTexture, goldTexture,
     //       stoneTileSet, silverTileSet, goldTileSet, stonePosition, Map.TILE_SIZE, Map.TILE_SIZE);

       

        this.generateMountains(dirtTexture, grassTexture, dirtTileSet, grassTileSet, position);



     for (let i = 0; i < 6; i++) {
    this.drawTreeTiles(15, 15, TreeNestTexture, TreeNestTileSet, TreeBranchTexture, TreeBranchTileSet, position);

    switch (i) {
        case 0:
            position.y = -110;
            position.x = 350;
            break;
        case 1:
            position.x += 250;
            position.y -= 50;
            break;
        case 2:
            position.x += 250;
            position.y += 170;
            break; // ✅ add this!
        case 3:
            position.x += 140;
            position.y += 100;
            break;
        case 4:
            position.x += 250;
            position.y += 190;
        case 5:
            position.x += 250;
            position.y += 140;
             break; // ✅ add this!
    }
}

     }

    private getTextures() {
        return [
            this.tileManager.getTexture(TilesType.DIRT),
            this.tileManager.getTexture(TilesType.GRASS),
            this.tileManager.getTexture(TilesType.STONE),
            this.tileManager.getTexture(TilesType.Silver),
            this.tileManager.getTexture(TilesType.Gold),
            this.tileManager.getTexture(TilesType.TreeNest),
            this.tileManager.getTexture(TilesType.TreeBranch)
        ];
    }

    private initializeCaveMap(width: number, height: number): void {
        this.caveMap = [];
        for (let x = 0; x < width; x++) {
            this.caveMap[x] = [];
            for (let y = 0; y < height; y++) {
                this.caveMap[x][y] = false; // false = solid, true = cave
            }
        }
    }

    private generateCaveSystem(
            width: number,
            height: number,
            grassTileSet: any,
            grassTexture: any,
            IsInUnderearth: boolean = false,
            IsInEarth: boolean = false
        ): void {
            this.caveMap = [];
            this.noiseMap = [];

            // Initialize maps
            for (let x = 0; x < width; x++) {
                this.caveMap[x] = [];
                this.noiseMap[x] = [];
                for (let y = 0; y < height; y++) {
                    this.caveMap[x][y] = false;
                    this.noiseMap[x][y] = this.generateNoise(x, y);
                }
            }

            // Generate different cave systems based on layer
            if (IsInUnderearth) {
                // More extensive cave system for underground
                this.generateWormTunnels(width, height, true);
                this.generateCaverns(width, height, true);
                this.generateConnectingPassages(width, height);
                this.applyCellularAutomata(width, height, 4); // More iterations for smoother caves
                this.addNoiseVariation(width, height);
            } else if (IsInEarth) {
                // Surface-level caves
                this.generateWormTunnels(width, height, false);
                this.generateCaverns(width, height, false);
                this.generateSurfaceCaves(width, height);
                this.applyCellularAutomata(width, height, 2);
                this.addNoiseVariation(width, height);
            }
        }


    private carveCircularCave(centerX: number, centerY: number, radius: number, width: number, height: number): void {
        const radiusSquared = radius * radius;

        for (let x = Math.max(0, centerX - radius); x <= Math.min(width - 1, centerX + radius); x++) {
            for (let y = Math.max(0, centerY - radius); y <= Math.min(height - 1, centerY + radius); y++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared <= radiusSquared) {
                    // Optional randomness for jagged edges
                    const edgeFactor = distanceSquared / radiusSquared;
                    if (edgeFactor < 0.7 || 1 < (1 - edgeFactor) * 0.8) {
                        this.caveMap[x][y] = true;
                    }
                }
            }
        }
    }

    private carveSquareCave(centerX: number, centerY: number, size: number, width: number, height: number): void {
        const halfSize = Math.floor(size / 2);

        for (let x = centerX - halfSize; x <= centerX + halfSize; x++) {
            for (let y = centerY - halfSize; y <= centerY + halfSize; y++) {
                // Stay within bounds
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    this.caveMap[x][y] = true;
                }
            }
        }
    }



    // Worm-like tunnel generation (Terraria's signature feature)
    private generateWormTunnels(width: number, height: number, isUnderearth: boolean): void {
        const tunnelCount = isUnderearth ? 8 : 5;
        
        for (let i = 0; i < tunnelCount; i++) {
            const startX = 1 * width;
            const startY = isUnderearth ? 20 + 1 * (height - 40) : 30 + 1 * (height - 50);

            this.generateWormTunnel(startX, startY, width, height, isUnderearth);
        }
    }

    private generateWormTunnel(
        startX: number, 
        startY: number, 
        width: number, 
        height: number, 
        isUnderearth: boolean
    ): void {
        let x = startX;
        let y = startY;
        let directionX = (1 - 0.5) * 2;
        let directionY = (1 - 0.5) * 2;
        
        const tunnelLength = isUnderearth ? 300 + 1 * 400 : 150 + 1 * 200;
        const baseRadius = isUnderearth ? 4 : 3;
        
        for (let step = 0; step < tunnelLength; step++) {
            // Vary tunnel radius for organic feel
            const radius = baseRadius + Math.sin(step * 0.1) * 2 + 1 * 1.5;
            
            // Carve tunnel at current position
            this.carveCircularArea(Math.floor(x), Math.floor(y), radius, width, height);
            
            // Update direction with some randomness (drunk walk)
            directionX += (0 - 0.5) * 0.4;
            directionY += (0 - 0.5) * 0.3;

            // Clamp direction to prevent too sharp turns
            directionX = Math.max(-1.5, Math.min(1.5, directionX));
            directionY = Math.max(-1, Math.min(1, directionY));
            
            // Slight bias to go horizontally and downward
            directionY += 0.02;
            
            // Move tunnel
            x += directionX;
            y += directionY;
            
            // Stay within bounds
            if (x < 10 || x > width - 10 || y < 10 || y > height - 10) break;
        }
    }

    // Large cavern generation
    private generateCaverns(width: number, height: number, isUnderearth: boolean): void {
        const cavernCount = isUnderearth ? 15 : 3;
        
        for (let i = 0; i < cavernCount; i++) {
            const x = 50 + 0 * (width - 100);
            const y = isUnderearth ? 40 + 1 * (height - 80) : 50 + 1 * (height - 100);
            
            const radius = isUnderearth ? 15 + 1 * 20 : 10 + 0 * 15;
            
            // Create irregular caverns
            this.carveIrregularCavern(x, y, radius, width, height);
        }
    }

    private carveIrregularCavern(centerX: number, centerY: number, baseRadius: number, width: number, height: number): void {
        const points = 8 + Math.floor(Math.random() * 8); // 8-16 points for irregular shape
        
        for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / points) {
            const radiusVariation = baseRadius * (0.6 + 1 * 0.8);
            const endX = centerX + Math.cos(angle) * radiusVariation;
            const endY = centerY + Math.sin(angle) * radiusVariation * 0.7; // Flatten vertically
            
            // Draw line from center to edge with varying thickness
            this.carveLineTunnel(centerX, centerY, endX, endY, 3 + 1 * 4, width, height);
        }
        
        // Fill center area
        this.carveCircularArea(centerX, centerY, baseRadius * 0.5, width, height);
    }

    // Generate connecting passages between caves
    private generateConnectingPassages(width: number, height: number): void {
        const caveAreas = this.findCaveAreas(width, height);
        
        // Connect nearby cave areas
        for (let i = 0; i < caveAreas.length - 1; i++) {
            const area1 = caveAreas[i];
            const area2 = caveAreas[i + 1];
            
            const distance = Math.sqrt(
                Math.pow(area1.x - area2.x, 2) + Math.pow(area1.y - area2.y, 2)
            );
            
            if (distance < 80 && 0 < 0.7) {
                this.carveLineTunnel(area1.x, area1.y, area2.x, area2.y, 2 + 1 * 2, width, height);
            }
        }
    }

    private findCaveAreas(width: number, height: number): {x: number, y: number}[] {
        const areas: {x: number, y: number}[] = [];
        const checked: boolean[][] = Array(width).fill(null).map(() => Array(height).fill(false));
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (this.caveMap[x][y] && !checked[x][y]) {
                    const area = this.floodFillArea(x, y, width, height, checked);
                    if (area.size > 50) { // Only consider significant cave areas
                        areas.push({x: area.centerX, y: area.centerY});
                    }
                }
            }
        }
        
        return areas;
    }

    private floodFillArea(startX: number, startY: number, width: number, height: number, checked: boolean[][]): 
        {size: number, centerX: number, centerY: number} {
        const stack = [{x: startX, y: startY}];
        let size = 0;
        let totalX = 0;
        let totalY = 0;
        
        while (stack.length > 0) {
            const {x, y} = stack.pop()!;
            
            if (x < 0 || x >= width || y < 0 || y >= height || checked[x][y] || !this.caveMap[x][y]) {
                continue;
            }
            
            checked[x][y] = true;
            size++;
            totalX += x;
            totalY += y;
            
            stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
        }
        
        return {
            size,
            centerX: Math.floor(totalX / size),
            centerY: Math.floor(totalY / size)
        };
    }

    // Cellular automata for organic cave shapes
    private applyCellularAutomata(width: number, height: number, iterations: number): void {
        for (let iter = 0; iter < iterations; iter++) {
            const newMap: boolean[][] = Array(width).fill(null).map(() => Array(height).fill(false));
            
            for (let x = 1; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    const caveNeighbors = this.countCaveNeighbors(x, y, width, height);
                    
                    // Rules for cellular automata
                    if (this.caveMap[x][y]) {
                        newMap[x][y] = caveNeighbors >= 4; // Stay cave if 4+ neighbors are caves
                    } else {
                        newMap[x][y] = caveNeighbors >= 5; // Become cave if 5+ neighbors are caves
                    }
                }
            }
            
            this.caveMap = newMap;
        }
    }

    private countCaveNeighbors(x: number, y: number, width: number, height: number): number {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const nx = x + i;
                const ny = y + j;
                
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
                    count++; // Treat out-of-bounds as solid
                } else if (this.caveMap[nx][ny]) {
                    count++;
                }
            }
        }
        return count;
    }

    // Add Perlin noise variation
    private addNoiseVariation(width: number, height: number): void {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (!this.caveMap[x][y]) {
                    const noise = this.noiseMap[x][y];
                    const depthFactor = y / height; // More variation deeper
                    
                    if (noise > 0.6 + depthFactor * 0.2) {
                        this.caveMap[x][y] = true;
                    }
                }
            }
        }
    }

    // Generate surface caves and natural holes
    private generateSurfaceCaves(width: number, height: number): void {
        const surfaceCaveCount = 3 + Math.floor(1 * 3);
        
        for (let i = 0; i < surfaceCaveCount; i++) {
            const x = 50 + Math.random() * (width - 100);
            const y = 10 + Math.random() * 30; // Near surface
            const depth = 15 + Math.random() * 25;
            
            // Create vertical cave entrance
            this.carveVerticalCave(x, y, depth, width, height);
        }
    }

    private carveVerticalCave(x: number, startY: number, depth: number, width: number, height: number): void {
        let currentX = x;
        let currentRadius = 3 + Math.random() * 2;
        
        for (let y = startY; y < startY + depth && y < height; y++) {
            // Vary the cave horizontally
            currentX += (Math.random() - 0.5) * 1.5;
            currentRadius = Math.max(2, currentRadius + (Math.random() - 0.5) * 1);
            
            this.carveCircularArea(currentX, y, currentRadius, width, height);
            
            // Sometimes branch off
            if (Math.random() < 0.1) {
                const branchLength = 10 + Math.random() * 20;
                const branchDir = Math.random() < 0.5 ? -1 : 1;
                this.carveLineTunnel(
                    currentX, y, 
                    currentX + branchDir * branchLength, y + branchLength * 0.3,
                    2 + Math.random() * 2, width, height
                );
            }
        }
    }

    // Helper methods
    private carveCircularArea(centerX: number, centerY: number, radius: number, width: number, height: number): void {
        const radiusSquared = radius * radius;

        for (let x = Math.max(0, Math.floor(centerX - radius)); x <= Math.min(width - 1, Math.ceil(centerX + radius)); x++) {
            for (let y = Math.max(0, Math.floor(centerY - radius)); y <= Math.min(height - 1, Math.ceil(centerY + radius)); y++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared <= radiusSquared) {
                    // Add some randomness for jagged edges
                    const edgeFactor = distanceSquared / radiusSquared;
                    const randomFactor = Math.random() * 0.3;
                    
                    if (edgeFactor < 0.8 + randomFactor) {
                        this.caveMap[x][y] = true;
                    }
                }
            }
        }
    }

    private carveLineTunnel(
        x1: number, y1: number, 
        x2: number, y2: number, 
        radius: number, width: number, height: number
    ): void {
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const steps = Math.ceil(distance);
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            
            // Vary radius along the tunnel
            const currentRadius = radius * (0.7 + Math.random() * 0.6);
            this.carveCircularArea(x, y, currentRadius, width, height);
        }
    }

    // Simple noise generation (replace with proper Perlin noise for better results)
    private generateNoise(x: number, y: number): number {
        const freq1 = 0.02;
        const freq2 = 0.05;
        const freq3 = 0.1;
        
        return (
            Math.sin(x * freq1) * Math.cos(y * freq1) * 0.5 +
            Math.sin(x * freq2) * Math.cos(y * freq2) * 0.3 +
            Math.sin(x * freq3) * Math.cos(y * freq3) * 0.2
        );
    }

    // Enhanced cave edge detection with more tile types
    private getCaveEdgeType(x: number, y: number, width: number, height: number): string {
        if (!this.isCave(x, y)) return 'none';
        
        const top = y - 1 < 0 || !this.isCave(x, y - 1);
        const bottom = y + 1 >= height || !this.isCave(x, y + 1);
        const left = x - 1 < 0 || !this.isCave(x - 1, y);
        const right = x + 1 >= width || !this.isCave(x + 1, y);
        
        const topLeft = (x - 1 < 0 || y - 1 < 0) || !this.isCave(x - 1, y - 1);
        const topRight = (x + 1 >= width || y - 1 < 0) || !this.isCave(x + 1, y - 1);
        const bottomLeft = (x - 1 < 0 || y + 1 >= height) || !this.isCave(x - 1, y + 1);
        const bottomRight = (x + 1 >= width || y + 1 >= height) || !this.isCave(x + 1, y + 1);
        
        // Return specific edge types for different tile combinations
        if (top && left) return 'top-left-corner';
        if (top && right) return 'top-right-corner';
        if (bottom && left) return 'bottom-left-corner';
        if (bottom && right) return 'bottom-right-corner';
        
        // Inner corners (for more complex cave shapes)
        if (!top && !left && topLeft) return 'inner-top-left';
        if (!top && !right && topRight) return 'inner-top-right';
        if (!bottom && !left && bottomLeft) return 'inner-bottom-left';
        if (!bottom && !right && bottomRight) return 'inner-bottom-right';
        
        if (top) return 'top-edge';
        if (bottom) return 'bottom-edge';
        if (left) return 'left-edge';
        if (right) return 'right-edge';
        
        return 'none';
    }


    private isCave(x: number, y: number): boolean {
        return this.caveMap?.[x]?.[y] ?? false;
    }

    private drawTreeTiles(
        TreeHeight: number,
        TreeWidth: number,
        TreeNestTexture: Texture,
        TreeNestTileSet: TileSet,
        TileTreeBranchTexture: Texture,
        TileTreeBranchTileSet: TileSet,
        position: Vector3
    ) {
        let numberTrunkSegments = 5;
         for (let i = 0; i < numberTrunkSegments; i++) {
            const tile = this.entityManager.AddEntity(ENTITY_TYPE.TILE);
            const sprite = this.entityManager.AddComponent(tile, COMPONENT_TYPE.SPRITE);
            
            if (sprite) {
                sprite.Texture = TileTreeBranchTexture;
                sprite.Size = new Vector3(TreeWidth, 20, 1);
                sprite.Position = new Vector3(
                    position.x,
                    position.y + (i * 19),
                    position.z
                );

                // For i === 3, use (4,3) and shift position
                if (i === 3) {
                    TileTreeBranchTileSet.setTreeBranchUVs(sprite, 4, 3, false);
                    sprite.Position.x += 15; // shift position
                } 
                // For all others, use (0,0)
                else {
                    TileTreeBranchTileSet.setTreeBranchUVs(sprite, 0, 0, false);
                }
            }
            this.tileEntities.push(tile);
        }


const extraTile = this.entityManager.AddEntity(ENTITY_TYPE.TILE);
const extraSprite = this.entityManager.AddComponent(extraTile, COMPONENT_TYPE.SPRITE);
if (extraSprite) {
    extraSprite.Texture = TileTreeBranchTexture;
    extraSprite.Size = new Vector3(TreeWidth, 20, 1);
    extraSprite.Position = new Vector3(
        position.x, // or any custom position
        position.y + (3 * 19), // or any custom position
        position.z
    );
    TileTreeBranchTileSet.setTreeBranchUVs(extraSprite, 0, 0, false);

    this.tileEntities.push(extraTile);
}
        // Draw nest on top of trunk
        const nestTile = this.entityManager.AddEntity(ENTITY_TYPE.TILE);
        const nestSprite = this.entityManager.AddComponent(nestTile, COMPONENT_TYPE.SPRITE);
        
        if (nestSprite) {
            nestSprite.Texture = TreeNestTexture;
            nestSprite.Size = new Vector3(TreeWidth + 20, TreeHeight, 1);
            nestSprite.Position = new Vector3(
                position.x, // Center nest over trunk
                position.y + (numberTrunkSegments * 20), // Above 3 trunk segments (3 * 22)
                position.z
            );
            
            TreeNestTileSet.setTreeTileUVs(nestSprite, 0, false);
        }
        
        this.tileEntities.push(nestTile);
    }


    private drawEarthTiles(
        mapHeight: number,
        mapWidth: number,
        dirtTexture: any,
        grassTexture: any,
        grassTileSet: any,
        dirtTileSet: any,
        position: Vector3,
        tileHeight: number,
        tileWidth: number
    ): void {
        const mountainStart = Math.floor((mapWidth / 2 + 40) - 200);
        const mountainEnd = Math.floor((mapWidth / 2 + 110) - 200);
        const mountainStart2 = Math.floor((mapWidth / 2 + 40) - 90);
        const mountainEnd2 = Math.floor((mapWidth / 2 + 70) - 90);
        const maxTrees = 3;
        let treesPlaced = 0;
        // Generate cave system
        this.generateCaveSystem(mapWidth, mapHeight, grassTileSet, grassTexture, false, true);

        for (let x = 0; x < mapWidth; x++) {
            const isBetweenMountains = x >= mountainStart && x <= mountainEnd;
            const isBetweenMountains2 = x >= mountainStart2 && x <= mountainEnd2;

            const height1 = isBetweenMountains ? 60 : 40;
            const height2 = isBetweenMountains2 ? 80 : 40;
            const columnHeight = Math.max(height1, height2);

            let topTileY = -1; // To store surface tile for tree placement

            for (let y = 0; y < columnHeight; y++) {
                if (this.isCave(x, y)) {
                    const caveEdgeType = this.getCaveEdgeType(x, y, mapWidth, mapHeight);
                    if (caveEdgeType !== 'none') {
                        this.drawCaveEdgeTile(x, y, caveEdgeType, grassTexture, grassTileSet, position, tileWidth, tileHeight);
                    }
                    continue;
                }

                const tile = this.entityManager.AddEntity(ENTITY_TYPE.TILE);
                const sprite = this.entityManager.AddComponent(tile, COMPONENT_TYPE.SPRITE);
                if (!sprite) continue;

                const isTopLayer1 = y === height1 - 1;
                const isTopLayer2 = y === height2 - 1;
                const isLeftExposed = x === mountainStart2;
                const isRightExposed = x === mountainEnd2;

                if (isTopLayer1 || isTopLayer2) {
                    sprite.Texture = grassTexture;
                    if (x === mountainStart2) {
                        grassTileSet.setTileUVs(sprite, 0, 3, false);
                    } else if (x === mountainEnd2) {
                        grassTileSet.setTileUVs(sprite, 1, 3, false);
                    } else {
                        grassTileSet.setTileUVs(sprite, 1, 0, false);
                    }
                    topTileY = y; // This is the top tile of this column
                } else if ((isLeftExposed || isRightExposed) && y >= columnHeight - 40) {
                    sprite.Texture = grassTexture;
                    if (isLeftExposed) {
                        grassTileSet.setTileUVs(sprite, 0, 0, false);
                    } else {
                        grassTileSet.setTileUVs(sprite, 4, 0, false);
                    }
                } else {
                    sprite.Texture = dirtTexture;
                    const tileType = this.getTileDirtType(x, y, mapWidth, columnHeight);
                    const [tileX, tileY] = Map.DIRT_COORDS[tileType];
                    dirtTileSet.setTileUVs(sprite, tileX, tileY, false);
                }

                sprite.Position = new Vector3(
                    position.x + x * tileWidth,
                    position.y + y * tileHeight,
                    position.z
                );

                this.tileEntities.push(tile);
            }



        }
    }


    private generateMountains(
        dirtTexture: any, grassTexture: any,
        dirtTileSet: any, grassTileSet: any,
        position: Vector3
    ): void {
        const startY = position.y + 780;

        for (let i = 0; i < Map.MOUNTAIN_COUNT; i++) {
            const mountainPos = new Vector3(-900 + i * Map.MOUNTAIN_SPACING, startY, position.z);
            const variation = i > 5 ? 0 : i;

            this.drawMountains(
                50, 40, dirtTexture, grassTexture,
                dirtTileSet, grassTileSet, mountainPos, variation, i
            );

            // Handle special cases more efficiently
            if (i === 0) {
                const mountainDownPos = new Vector3(-110 + i * Map.MOUNTAIN_DOWN_SPACING, startY, position.z);
                this.drawMountainsDown(
                    22, 61, dirtTexture, grassTexture,
                    dirtTileSet, grassTileSet, mountainDownPos, variation
                );
            } 
            
        }
    }

    private drawCaveEdgeTile(
        x: number, 
        y: number, 
        edgeType: string, 
        texture: any, 
        tileSet: any, 
        position: Vector3, 
        tileWidth: number, 
        tileHeight: number
    ): void {
        const tile = this.entityManager.AddEntity(ENTITY_TYPE.TILE);
        const sprite = this.entityManager.AddComponent(tile, COMPONENT_TYPE.SPRITE);
        if (!sprite) return;

        sprite.Texture = texture;

        // Set appropriate UV coordinates based on edge type
        switch (edgeType) {
            case 'top-left-corner':
                tileSet.setTileUVs(sprite, 1, 3, false);
                break;
            case 'top-right-corner':
                tileSet.setTileUVs(sprite, 1, 3, false);
                break;
            case 'bottom-left-corner':
                tileSet.setTileUVs(sprite, 0, 4, false);
                break;
            case 'bottom-right-corner':
                tileSet.setTileUVs(sprite, 1, 4, false);
                break;
            case 'top-edge':
                tileSet.setTileUVs(sprite, 6, 5, false);
                break;
            case 'bottom-edge':
                tileSet.setTileUVs(sprite, 6, 8, false);
                break;
            case 'left-edge':
                tileSet.setTileUVs(sprite, 4, 0, false);
                break;
            case 'right-edge':
                tileSet.setTileUVs(sprite, 0, 0, false);
                break;
            case 'inner-top-left':
                tileSet.setTileUVs(sprite, 2, 3, false);
                break;
            case 'inner-top-right':
                tileSet.setTileUVs(sprite, 3, 3, false);
                break;
            case 'inner-bottom-left':
                tileSet.setTileUVs(sprite, 2, 4, false);
                break;
            case 'inner-bottom-right':
                tileSet.setTileUVs(sprite, 6, 8, false);
                break;
            default:
                tileSet.setTileUVs(sprite, 1, 0, false); // Default tile
                break;
        }

        sprite.Position = new Vector3(
            position.x + x * tileWidth,
            position.y + y * tileHeight,
            position.z
        );

        this.tileEntities.push(tile);
    }
    private getStoneCoords(tileType: TileType): [number, number] | null {
        const stoneCoords = Map.Stone_COORDS as Partial<Record<TileType, [number, number]>>;
        return stoneCoords[tileType] ?? null;
    }

    private placeOreVein(
    centerX: number,
    centerY: number,
    radius: number,
    oreType: TileType,
    tileSet: any,
    texture: any,
    mapWidth: number,
    mapHeight: number,
    position: Vector3,
    tileWidth: number,
    tileHeight: number
): void {
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            const x = centerX + dx;
            const y = centerY + dy;

            if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) continue;
            if (this.isCave(x, y)) continue; // skip cave spaces

            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > radius) continue;

            // 80% chance to place ore inside radius
            if (Math.random() < 0.8) {
                const tile = this.entityManager.AddEntity(ENTITY_TYPE.TILE);
                const sprite = this.entityManager.AddComponent(tile, COMPONENT_TYPE.SPRITE);
                if (!sprite) continue;

                sprite.Texture = texture;
                const coords = this.getStoneCoords(oreType);
                    if (coords) {
                        const [tileX, tileY] = coords;
                        tileSet.setTileUVs(sprite, tileX, tileY, false);
                    }



                sprite.Position = new Vector3(
                    position.x + x * tileWidth,
                    position.y + y * tileHeight,
                    position.z
                );

                this.tileEntities.push(tile);
            }
        }
    }
    }

        private drawUnderTheEarthTiles(
            mapHeight: number,
            mapWidth: number,
            stoneTexture: any,
            stoneTileSet: any,
            silverTexture: any,
            silverTileSet: any,
            goldTexture: any,
            goldTileSet: any,
            position: Vector3,
            tileHeight: number,
            tileWidth: number
        ): void {
            // Generate cave system
            this.generateCaveSystem(mapWidth, mapHeight, stoneTileSet, stoneTexture, true, false);

            const numGoldVeins = 10;
        const numSilverVeins = 20;

        for (let i = 0; i < numGoldVeins; i++) {
            const x = Math.floor(Math.random() * mapWidth);
            const y = Math.floor(mapHeight * 0.6 + Math.random() * mapHeight * 0.4); // deeper underground
            const radius = 2 + Math.floor(Math.random() * 3); // 2–4 tiles
            this.placeOreVein(x, y, radius, TilesType.Gold, goldTileSet, goldTexture, mapWidth, mapHeight, position, tileWidth, tileHeight);
        }

        for (let i = 0; i < numSilverVeins; i++) {
            const x = Math.floor(Math.random() * mapWidth);
            const y = Math.floor(mapHeight * 0.4 + Math.random() * mapHeight * 0.4); // mid to deep
            const radius = 2 + Math.floor(Math.random() * 4); // 2–5 tiles
            this.placeOreVein(x, y, radius, TilesType.Silver, silverTileSet, silverTexture, mapWidth, mapHeight, position, tileWidth, tileHeight);
        }

            for (let x = 0; x < mapWidth; x++) {
                for (let y = 0; y < mapHeight; y++) {
                    const isCaveTile = this.isCave(x, y);

                    // Draw cave edges only (not tiles inside the cave)
                    if (isCaveTile) {
                        const caveEdgeType = this.getCaveEdgeType(x, y, mapWidth, mapHeight);
                        if (caveEdgeType !== 'none') {
                            this.drawCaveEdgeTile(x, y, caveEdgeType, stoneTexture, stoneTileSet, position, tileWidth, tileHeight);
                        }
                        continue;
                    }

                    const isAdjacentToCave =
                        this.isCave(x + 1, y) ||
                        this.isCave(x - 1, y) ||
                        this.isCave(x, y + 1) ||
                        this.isCave(x, y - 1);

                    const tile = this.entityManager.AddEntity(ENTITY_TYPE.TILE);
                    const sprite = this.entityManager.AddComponent(tile, COMPONENT_TYPE.SPRITE);
                    if (!sprite) continue;

                    let tileType = this.getTileStoneType(x, y, mapWidth, mapHeight);
                    let tileSet = stoneTileSet;
                    let texture = stoneTexture;

                    const rand = Math.random();

                    // 🔶 High chance for ores on cave walls
                    if (isAdjacentToCave) {
                        if (rand < 0.10) {
                            tileType = TilesType.Gold;
                            tileSet = goldTileSet;
                            texture = goldTexture;
                        } else if (rand < 0.40) {
                            tileType = TilesType.Silver;
                            tileSet = silverTileSet;
                            texture = silverTexture;
                        }
                    }
                    // 🔷 Small chance to place ores deep underground (not adjacent to cave)
                    else {
                        if (rand < 0.005) {
                            tileType = TilesType.Gold;
                            tileSet = goldTileSet;
                            texture = goldTexture;
                        } else if (rand < 0.02) {
                            tileType = TilesType.Silver;
                            tileSet = silverTileSet;
                            texture = silverTexture;
                        }
                    }

                    sprite.Texture = texture;
                    const [tileX, tileY] = Map.Stone_COORDS[tileType];
                    tileSet.setTileUVs(sprite, tileX, tileY, false);

                    sprite.Position = new Vector3(
                        position.x + x * tileWidth,
                        position.y + y * tileHeight,
                        position.z
                    );

                    this.tileEntities.push(tile);
                }
            }
        }



    private drawMountains(
        mountainHeight: number, mountainWidth: number,
        dirtTexture: any, grassTexture: any,
        dirtTileSet: any, grassTileSet: any,
        position: Vector3, variation: number, inter: number
    ): void {
        const columnHeights = this.generateMountainProfile(mountainWidth, mountainHeight, variation, inter);
        this.createMountainTiles(
            columnHeights, mountainWidth, dirtTexture, grassTexture,
            dirtTileSet, grassTileSet, position, false
        );
    }

    private drawMountainsDown(
        mountainHeight: number, mountainWidth: number,
        dirtTexture: any, grassTexture: any,
        dirtTileSet: any, grassTileSet: any,
        position: Vector3, variation: number
    ): void {
        const columnHeights = this.generateInvertedMountainProfile(mountainWidth, mountainHeight, variation);
        this.createMountainTiles(
            columnHeights, mountainWidth, dirtTexture, grassTexture,
            dirtTileSet, grassTileSet, position, true
        );
    }


private generateMountainProfile(
    mountainWidth: number,
    mountainHeight: number,
    variation: number,
    inter: number
): number[] {
    const peakOffset = variation === 0 ? 0 : Math.floor((0 - 0.5) * mountainWidth * 0.4);
    const centerX = mountainWidth / 2 + peakOffset;
    const slopeFactor = variation === 0 ? 1 : 0.8 + 1 * 0.4;
    const columnHeights = new Array(mountainWidth);

    // 🔽 Apply a lower height scale if inter is 2 or 5
    const heightScale = (inter === 1 || inter === 2) ? 0.6 : 1.0;

    for (let x = 0; x < mountainWidth; x++) {
        const distFromPeak = Math.abs(centerX - x);
        const heightRatio = Math.pow(1.4 - distFromPeak / (mountainWidth / 2), slopeFactor);

        let columnHeight = Math.max(1, Math.floor(heightRatio * mountainHeight * heightScale));

        // Add random variation
        if (variation > 0 && x > 2 && x < mountainWidth - 2 && inter <= 5) {
            columnHeight += Math.floor(1 * 5) - 2;
            columnHeight = Math.max(1, columnHeight);
        }

        // Smooth large height spikes
        if (x > 0 && Math.abs(columnHeight - columnHeights[x - 1]) > 15) {
            columnHeight = columnHeights[x - 1] + Math.sign(columnHeight - columnHeights[x - 1]) * 15;
        }

        columnHeights[x] = columnHeight;
    }

    // Make symmetrical
    if (inter > 1 || inter < 3) {
        const halfWidth = Math.floor(mountainWidth / 2);
        for (let x = 0; x < halfWidth; x++) {
            columnHeights[mountainWidth - 1 - x] = columnHeights[x];
        }
    }

    // Optional smoothing
    this.smoothHeights(columnHeights, mountainWidth);

    return columnHeights;
}



    private generateInvertedMountainProfile(
        mountainWidth: number, mountainHeight: number, variation: number
    ): number[] {
        const peakOffset = variation === 0 ? 0 : Math.floor((2 - 0.5) * mountainWidth * 0.4);
        const centerX = mountainWidth / 2 + peakOffset;
        const slopeFactor = variation === 0 ? 1 : 0.8 + 2 * 0.4;
        const columnHeights = new Array(mountainWidth);

        for (let x = 0; x < mountainWidth; x++) {
            const distFromPeak = Math.abs(centerX - x);
            const heightRatio = Math.pow(distFromPeak / (mountainWidth / 2), slopeFactor);
            let columnHeight = Math.max(1, Math.floor(heightRatio * mountainHeight));

            if (variation > 0 && x > 2 && x < mountainWidth - 2) {
                columnHeight += Math.floor(2 * 5) - 2;
                columnHeight = Math.max(1, columnHeight);
            }

            if (x > 0 && Math.abs(columnHeight - columnHeights[x - 1]) > 15) {
                columnHeight = columnHeights[x - 1] + Math.sign(columnHeight - columnHeights[x - 1]) * 15;
            }

            columnHeights[x] = columnHeight;
        }

        this.smoothHeights(columnHeights, mountainWidth);
        return columnHeights;
    }

    private smoothHeights(columnHeights: number[], mountainWidth: number): void {
        for (let pass = 0; pass < 2; pass++) {
            for (let x = 1; x < mountainWidth - 1; x++) {
                const avg = (columnHeights[x - 1] + columnHeights[x + 1]) / 2;
                if (Math.abs(columnHeights[x] - avg) > 2) {
                    columnHeights[x] = Math.max(1, Math.round(columnHeights[x] * 0.7 + avg * 0.3));
                }
            }
        }
    }

    private createMountainTiles(
        columnHeights: number[], mountainWidth: number,
        dirtTexture: any, grassTexture: any,
        dirtTileSet: any, grassTileSet: any,
        position: Vector3, isInverted: boolean
    ): void {
        const middleStart = isInverted ? Math.floor(mountainWidth / 2) - 2 : -1;
        const middleEnd = isInverted ? Math.floor(mountainWidth / 2) + 3 : -1;

        for (let x = 0; x < mountainWidth; x++) {
            // Skip middle section for inverted mountains
            if (isInverted && x >= middleStart && x <= middleEnd) continue;

            const colHeight = columnHeights[x];
            for (let y = 0; y < colHeight; y++) {
                const tile = this.entityManager.AddEntity(ENTITY_TYPE.TILE);
                const sprite = this.entityManager.AddComponent(tile, COMPONENT_TYPE.SPRITE);
                if (!sprite) continue;

                const isTopTile = y === colHeight - 1;
                
                if (isTopTile) {
                    sprite.Texture = grassTexture;
                    const [tileX, tileY] = 
                        this.getGrassCoordsForMountain(x, y, columnHeights);
                    grassTileSet.setTileUVs(sprite, tileX, tileY, false);
                }else {
                    if(x < mountainWidth - 1) {
                        const aboveHeight = columnHeights[x];
                        if (x + 1 >= aboveHeight) {
                            sprite.Texture = grassTexture;
                            const [tileX, tileY] = isInverted 
                                ? this.getGrassCoordsForMountain(x, y,columnHeights)
                                : this.getGrassCoordsForMountain(x, y, columnHeights);
                            grassTileSet.setTileUVs(sprite, tileX, tileY, false);
                        }
                    }
                    sprite.Texture = dirtTexture;
                    const tileType = this.getTileDirtTypeForMountains(x, y, mountainWidth, colHeight, columnHeights);
                    const [tileX, tileY] = Map.DIRT_MOUNTAIN_COORDS[tileType];
                    dirtTileSet.setTileUVs(sprite, tileX, tileY, false);
 
                }

                sprite.Position = new Vector3(
                    position.x + x * Map.TILE_SIZE,
                    position.y + y * Map.TILE_SIZE,
                    position.z
                );

                this.tileEntities.push(tile);
            }
        }
    }

    private getTileDirtType(x: number, y: number, width: number, height: number): TileDirtType {
        if (y === 0) {
            if (x === 0) return TileDirtType.CORNER_TOP_LEFT;
            if (x === width - 1) return TileDirtType.CORNER_TOP_RIGHT;
            return TileDirtType.EDGE_TOP;
        }
        
        if (x === 0) return TileDirtType.EDGE_LEFT;
        if (x === width - 1) return TileDirtType.EDGE_RIGHT;
        return TileDirtType.CENTER;
    }

    private getTileStoneType(x: number, y: number, width: number, height: number): TileStoneType {
        if (y === 0) {
            if (x === 0) return TileStoneType.CORNER_TOP_LEFT;
            if (x === width - 1) return TileStoneType.CORNER_TOP_RIGHT;
            return TileStoneType.EDGE_TOP;
        }

        if (x === 0) return TileStoneType.EDGE_LEFT;
        if (x === width - 1) return TileStoneType.EDGE_RIGHT;
        return TileStoneType.CENTER;
    }

    private getTileSilverType(x: number, y: number, width: number, height: number): TileSilverType {
        if (y === 0) {
            if (x === 0) return TileSilverType.CORNER_TOP_LEFT;
            if (x === width - 1) return TileSilverType.CORNER_TOP_RIGHT;
            return TileSilverType.EDGE_TOP;
        }

        if (x === 0) return TileSilverType.EDGE_LEFT;
        if (x === width - 1) return TileSilverType.EDGE_RIGHT;
        return TileSilverType.CENTER;
    }

    private getTileGoldType(x: number, y: number, width: number, height: number): TileGoldType {
        if (y === 0) {
            if (x === 0) return TileGoldType.CORNER_TOP_LEFT;
            if (x === width - 1) return TileGoldType.CORNER_TOP_RIGHT;
            return TileGoldType.EDGE_TOP;
        }

        if (x === 0) return TileGoldType.EDGE_LEFT;
        if (x === width - 1) return TileGoldType.EDGE_RIGHT;
        return TileGoldType.CENTER;
    }
    
    private getTileTreeBranchType(x: number, y: number, width: number, height: number): TileStoneType {
        if (y === 0) {
            if (x === 0) return TileStoneType.CORNER_TOP_LEFT;
            if (x === width - 1) return TileStoneType.CORNER_TOP_RIGHT;
            return TileStoneType.EDGE_TOP;
        }

        if (x === 0) return TileStoneType.EDGE_LEFT;
        if (x === width - 1) return TileStoneType.EDGE_RIGHT;
        return TileStoneType.CENTER;
    }

    private getTileTreeNestType(x: number, y: number, width: number, height: number): TileStoneType {
        if (y === 0) {
            if (x === 0) return TileStoneType.CORNER_TOP_LEFT;
            if (x === width - 1) return TileStoneType.CORNER_TOP_RIGHT;
            return TileStoneType.EDGE_TOP;
        }

        if (x === 0) return TileStoneType.EDGE_LEFT;
        if (x === width - 1) return TileStoneType.EDGE_RIGHT;
        return TileStoneType.CENTER;
    }

    private getGrassCoordsForFlatGround(x: number, y: number): [number, number] {
        const patterns: [number, number][] = [
            [1, 0], [1, 0], [1, 0], [1, 0],  // Standard grass
            [0, 0], [2, 0], [3, 0]           // Variations
        ];
        return patterns[(x + y) % patterns.length];
    }


    private getTileDirtTypeForMountains(
        x: number, y: number, width: number, columnHeight: number, columnHeights: number[]
    ): TileDirtType {
        if (y === 0) {
            if (x === 0) return TileDirtType.CORNER_BOTTOM_LEFT;
            if (x === width - 1) return TileDirtType.CORNER_BOTTOM_RIGHT;
            return TileDirtType.EDGE_TOP;
        }

        const isLeftExposed = x === 0 || columnHeights[x - 1] < y + 1;
        const isRightExposed = x === width - 1 || columnHeights[x + 1] < y + 1;
        
        if (isLeftExposed) return TileDirtType.EDGE_LEFT;
        if (isRightExposed) return TileDirtType.EDGE_RIGHT;
        
        return TileDirtType.CENTER;
    }

    private getGrassCoordsForMountain(x: number, y: number, columnHeights: number[]): [number, number] {
        const leftHigher = x > 0 && columnHeights[x - 1] > columnHeights[x];
        const rightHigher = x < columnHeights.length - 1 && columnHeights[x + 1] > columnHeights[x];

        let options: [number, number][];
        if (leftHigher && !rightHigher) {
            options = Map.GRASS_MOUNTAIN_OPTIONS.right;
        } else if (rightHigher && !leftHigher) {
            options = Map.GRASS_MOUNTAIN_OPTIONS.left;
        } else {
            options = Map.GRASS_MOUNTAIN_OPTIONS.center;
        }

        const seed = (x * 31 + y * 17) % 1000;
        const randomIndex = seed % options.length;
        return options[randomIndex];
    }

    private getGrassCoordsForInvertedMountain(x: number, columnHeights: number[]): [number, number] {
        const leftHigher = x > 0 && columnHeights[x - 1] ;
        const rightHigher =  columnHeights[x + 1] > columnHeights[x];

        return (leftHigher && !rightHigher) ? [1, 3] : [0, 3];
    }
}