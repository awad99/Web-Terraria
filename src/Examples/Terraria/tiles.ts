export const TilesType = {
    None: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    Gold: 4,
    Silver: 5, 
    TreeNest: 6,
    TreeBranch: 7
} as const;

export type TileType = typeof TilesType[keyof typeof TilesType];

export function isNone(tile: TileType): boolean {
    return tile === TilesType.None;
}

export function isGrass(tile: TileType): boolean {
    return tile === TilesType.GRASS;
}

export function isDirt(tile: TileType): boolean {
    return tile === TilesType.DIRT;
}

export function isStone(tile: TileType): boolean {
    return tile === TilesType.STONE;
}

export function isGold(tile: TileType): boolean {
    return tile === TilesType.Gold;
}

export function isSilver(tile: TileType): boolean {
    return tile === TilesType.Silver; 
}

export function isTreeNest(tile: TileType): boolean {
    return tile === (TilesType.TreeNest && TilesType.TreeBranch);
}