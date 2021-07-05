export interface Board {
    grid: Grid,
    constraints: Record<string, Constraint>,
}

export interface Grid {
    width: number,
    height: number,
}

export enum ConstraintType {
    DIAGONAL = 'diagonal',
    KNIGHT = 'knight',
    KING = 'king',
    DISJOINT_GROUPS = 'disjointGroups',
    CONSECUTIVE = 'consecutive',
}

export type Constraint = BooleanConstraint | DigonalConstraint;

interface AbstractConstraint {
    type: ConstraintType,
    value: unknown,
}

export interface BooleanConstraint extends AbstractConstraint {
    type: ConstraintType.KNIGHT | ConstraintType.KING | ConstraintType.DISJOINT_GROUPS | ConstraintType.CONSECUTIVE,
    value: {
        positive: boolean,
        negative: boolean,
    },
}
export interface DigonalConstraint extends AbstractConstraint {
    type: ConstraintType.DIAGONAL,
    value: {
        positive: boolean,
        negative: boolean,
    },
}
