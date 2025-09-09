import { Instance } from "cspointscript";

export class Vector3 {
	constructor(public x: number, public y: number, public z: number) {}
	static fromArray(arr: [number, number, number]): Vector3 {
		return new Vector3(arr[0], arr[1], arr[2]);
	}
	static fromString(str: string): Vector3 {
		let arr = str.split(" ");
		return Vector3.fromArray([Number(arr[0]), Number(arr[1]), Number(arr[2])]);
	}
	toArray(): [number, number, number] {
		return [this.x, this.y, this.z];
	}
	clone(): Vector3 {
		return new Vector3(this.x, this.y, this.z);
	}
	add(v: Vector3): Vector3 {
		return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
	}
	sub(v: Vector3): Vector3 {
		return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
	}
	mul(v: Vector3): Vector3 {
		return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
	}
	scale(s: number): Vector3 {
		return new Vector3(this.x * s, this.y * s, this.z * s);
	}
	dot(v: Vector3): number {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}
	cross(v: Vector3): Vector3 {
		return new Vector3(
			this.y * v.z - this.z * v.y,
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	}
	length(): number {
		return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
	}
	normalize(): Vector3 {
		const len = this.length();
		return len === 0 ? new Vector3(0, 0, 0) : this.scale(1 / len);
	}
	distanceTo(v: Vector3): number {
		return this.sub(v).length();
	}
}

const callMap = new Map<string, Deferred<any>>();

type Deferred<T> = {
	promise: Promise<T | undefined>;
	resolve: (value?: T) => void;
};

let idCount = 0;
function createDeferred<T>(): [Promise<any>, string] {
	let resolve!: (value?: T) => void;

	const promise = new Promise<T | undefined>((res) => {
		resolve = res;
	});

	let id = (idCount++).toString();
	callMap.set(id, { promise, resolve });

	return [promise, id];
}

Instance.PublicMethod("ResolveID", (str: string) => {
	//Instance.Msg(str);
	let args = str.split(",");
	let id: string = args.shift() ?? "";
	const deferred = callMap?.get(id);
	if (deferred) {
		deferred.resolve(args);
		callMap.delete(id);
	} else {
		Instance.Msg(`callMap[${id}] missing`);
	}
});

let listener_queue: Array<string> = [];
const listenerMap = new Map<string, { callback: (activator: Ent) => void }>();
Instance.PublicMethod("SetActivator", (str: string) => {
	Instance.Msg("SetActivator:" + str);
	let listener = listener_queue.shift();
	if (listener !== undefined) {
		const entry = listenerMap.get(listener);
		entry?.callback(str as Ent);
	}
});
Instance.PublicMethod("QueueCallback", (str: string) => {
	Instance.Msg("QueueCallback: " + str);
	listener_queue.push(str);
});

let listener_id = 0;
export function ListenForOutput(
	entName: string,
	output: string,
	callback: (activator: Ent) => void
): void {
	let id = (listener_id++).toString();
	listenerMap.set(id, { callback: callback });
	Instance.EntFireBroadcast(
		entName,
		"AddOutput",
		output + ">pulssy_trigger>trigger>>0>-1",
		0
	);
	Instance.EntFireBroadcast(
		entName,
		"AddOutput",
		output + ">ts>QueueCallback>" + id + ">0>-1",
		0
	);
}

function SetParam(p: (string | number | Vector3)[]): void {
	const pushVec = function (vec: Vector3): void {
		Instance.EntFireBroadcast("pulse", "pushParam", vec.x, 0);
		Instance.EntFireBroadcast("pulse", "pushParam", vec.y, 0);
		Instance.EntFireBroadcast("pulse", "pushParam", vec.z, 0);
	};

	Instance.EntFireBroadcast("pulse", "clearParam", "", 0);
	p.forEach((item) => {
		if (item instanceof Vector3) {
			pushVec(item);
		} else {
			Instance.EntFireBroadcast("pulse", "pushParam", item, 0);
		}
	});
}

export const NULL_ENT: Ent = "-1" as Ent;
export type Ent = string & { readonly __brand: unique symbol };

export async function DebugLog(str: string): Promise<void> {
	let [promise, id] = createDeferred<void>();
	Instance.EntFireBroadcast("pulse", "str1", str, 0);
	Instance.EntFireBroadcast("pulse", "DebugLog", id, 0);
	return promise;
}

export async function FindByName(name: string): Promise<Ent> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", name, 0);
	Instance.EntFireBroadcast("pulse", "FindPulseEIDByName", id, 0);
	return (await promise)[0] as Ent;
}

export async function GetName(ent: Ent): Promise<string> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetName", id, 0);
	return (await promise)[0];
}

export async function GetClassname(ent: Ent): Promise<string> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetClassname", id, 0);
	return (await promise)[0];
}

export async function GetAbsOrigin(ent: Ent): Promise<Vector3> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetAbsOrigin", id, 0);
	return Vector3.fromString((await promise)[0]);
}

export async function SetOrigin(ent: Ent, v: Vector3): Promise<void> {
	let [promise, id] = createDeferred<void>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "SetOrigin", id, 0);
	return promise;
}

export async function AddVelocity(ent: Ent, v: Vector3): Promise<void> {
	let [promise, id] = createDeferred<void>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "AddVelocity", id, 0);
	return promise;
}

export async function GetForward(ent: Ent): Promise<Vector3> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetForward", id, 0);
	return Vector3.fromString((await promise)[0]);
}

export async function DealDamage(
	entTarget: Ent,
	entAttacker: Ent,
	dmg: number,
	force: Vector3
): Promise<void> {
	let [promise, id] = createDeferred<void>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DealDamage", id, 0);
	return promise;
}

export async function GetTraceHit(
	vStartPos: Vector3,
	vDirection: Vector3,
	fMaxLength: number,
	hIgnoreEntity: Ent
): Promise<{
	didHit: boolean;
	distance: number;
	location: Vector3;
	normal: Vector3;
	fraction: number;
	entity: Ent;
}> {
	let [promise, id] = createDeferred<void>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "GetTraceHit", id, 0);
	let results = await promise;
	//Instance.Msg(results);
	return {
		didHit: Boolean(results[0]),
		distance: Number(results[1]),
		location: Vector3.fromString(results[2]),
		normal: Vector3.fromString(results[3]),
		fraction: Number(results[4]),
		entity: results[5] as Ent,
	};
}

export async function RemoveEntity(ent: Ent): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "RemoveEntity", id, 0);
	return promise;
}

export async function PointTemplate_ForceSpawn(
	entTemplate: Ent,
	entLocation: Ent
): Promise<Array<Ent>> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "PointTemplateForceSpawn", id, 0);
	return (await promise) as Array<Ent>;
}

export async function EntFirePlayerPawn(
	entPlayer: Ent,
	input: string,
	param: string
): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "EntFirePlayerPawn", id, 0);
	return promise;
}

export async function Wait(delay: number): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("ts", "ResolveID", id, delay);
	return promise;
}

// broken?
export async function GetPlayerSlot(ent: Ent): Promise<number> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetPlayerSlot", id, 0);
	return Number((await promise)[0]);
}

export async function GetParent(ent: Ent): Promise<Ent> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetParent", id, 0);
	return (await promise)[0] as Ent;
}

export async function GetTeamNumber(ent: Ent): Promise<number> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetTeamNumber", id, 0);
	return Number((await promise)[0]);
}

export async function FindAllEntities(entityType: string): Promise<Array<Ent>> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", entityType, 0);
	Instance.EntFireBroadcast("pulse", "FindAllEntity", id, 0);
	return (await promise) as Array<Ent>;
}
