import type * as DcsJs from "@foxdelta2/dcsjs";

import { objectToPosition } from "./utils";

class QuadtreeNode<T extends DcsJs.Position | { position: DcsJs.Position }> {
	x: number;
	y: number;
	width: number;
	height: number;
	objectives: T[] = [];
	children: QuadtreeNode<T>[] = [];

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
}

export class Quadtree<T extends DcsJs.Position | { position: DcsJs.Position }> {
	root: QuadtreeNode<T>;

	constructor(x: number, y: number, width: number, height: number) {
		this.root = new QuadtreeNode(x, y, width, height);
	}

	insert(objective: T) {
		this.insertRecursive(this.root, objective);
	}

	private insertRecursive(node: QuadtreeNode<T>, objective: T) {
		const position = objectToPosition(objective);
		if (
			node.x <= position.x &&
			node.x + node.width >= position.x &&
			node.y <= position.y &&
			node.y + node.height >= position.y
		) {
			if (node.objectives.length < 4) {
				node.objectives.push(objective);
			} else {
				if (!node.children.length) {
					this.splitNode(node);
				}
				for (const child of node.children) {
					this.insertRecursive(child, objective);
				}
			}
		}
	}

	private splitNode(node: QuadtreeNode<T>) {
		const halfWidth = node.width / 2;
		const halfHeight = node.height / 2;
		node.children.push(
			new QuadtreeNode(node.x, node.y, halfWidth, halfHeight),
			new QuadtreeNode(node.x + halfWidth, node.y, halfWidth, halfHeight),
			new QuadtreeNode(node.x, node.y + halfHeight, halfWidth, halfHeight),
			new QuadtreeNode(node.x + halfWidth, node.y + halfHeight, halfWidth, halfHeight),
		);
	}

	findObjectivesInRange(position: DcsJs.Position, range: number): T[] {
		const objectivesInRange: T[] = [];
		this.findInRangeRecursive(this.root, position, range, objectivesInRange);
		return objectivesInRange;
	}

	private findInRangeRecursive(
		node: QuadtreeNode<T> | undefined,
		position: DcsJs.Position,
		range: number,
		objectivesInRange: T[],
	) {
		if (!node || node.objectives.length === 0) {
			return;
		}

		for (const obj of node.objectives) {
			const position = objectToPosition(obj);
			const distance = Math.sqrt((position.x - position.x) ** 2 + (position.y - position.y) ** 2);
			if (distance <= range) {
				objectivesInRange.push(obj);
			}
		}

		if (node.children.length) {
			const { x, y } = position;
			const [nw, ne, sw, se] = node.children;
			if (x - range <= (nw?.x ?? 0) + (nw?.width ?? 0) && y - range <= (nw?.y ?? 0) + (nw?.height ?? 0)) {
				this.findInRangeRecursive(nw, position, range, objectivesInRange);
			}
			if (x + range >= (ne?.x ?? 0) && y - range <= (ne?.y ?? 0) + (ne?.height ?? 0)) {
				this.findInRangeRecursive(ne, position, range, objectivesInRange);
			}
			if (x - range <= (sw?.x ?? 0) + (sw?.width ?? 0) && y + range >= (sw?.y ?? 0)) {
				this.findInRangeRecursive(sw, position, range, objectivesInRange);
			}
			if (x + range >= (se?.x ?? 0) && y + range >= (se?.y ?? 0)) {
				this.findInRangeRecursive(se, position, range, objectivesInRange);
			}
		}
	}
}

// export const quadtree = new Quadtree(-500000, -500000, 500000, 500000);
