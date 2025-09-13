// Report bugs and suggestion to easterlee
// https://discord.gg/hKzm6XfuYQ

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
		return new Vector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
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
	toString(): string {
		return `(${this.x}, ${this.y}, ${this.z})`;
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

type Listener = { self: Ent; once: boolean; callback: ListenerCallback };
type ListenerCallback = (self: Ent, activator: Ent) => void;

let listener_queue: Array<string> = [];
const listenerMap = new Map<string, Listener>();
Instance.PublicMethod("SetActivator", (str: string) => {
	//Instance.Msg("SetActivator:" + str);
	let key = listener_queue.shift();
	if (key !== undefined) {
		const listener = listenerMap.get(key);
		listener?.callback(listener.self, str as Ent);
		if (listener?.once) {
			listenerMap.delete(key);
		}
	}
});
Instance.PublicMethod("QueueCallback", (str: string) => {
	//Instance.Msg("QueueCallback: " + str);
	listener_queue.push(str);
});

Instance.PublicMethod("OnRoundStart", (str: string) => {
	OnRoundStart_fn(Number(str));
});

let OnRoundStart_fn: (nRoundNumber: number) => void = () => {};
export function OnRoundStart(fn: (nRoundNumber: number) => void) {
	OnRoundStart_fn = fn;
}

function str2Bool(str: string): boolean {
	return str === "true";
}

let listener_key = 0;

/**
 * Uses OnUser4
 */
export async function ListenForOutput(ent: Ent, output: string, once: boolean, callback: ListenerCallback): Promise<void> {
	let key = (listener_key++).toString();
	listenerMap.set(key, { self: ent, once: once, callback: callback });
	let onlyOnce = once ? "1" : "-1";
	await AddOutputByHandle(ent, output + ">pulssy_trigger>trigger>>0>" + onlyOnce);
	await AddOutputByHandle(ent, output + ">ts>QueueCallback>" + key + ">0>" + onlyOnce);
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

export type Ent = string & { readonly __brand: unique symbol };

export async function DebugLog(str: string): Promise<void> {
	let [promise, id] = createDeferred<void>();
	Instance.EntFireBroadcast("pulse", "str1", str, 0);
	Instance.EntFireBroadcast("pulse", "DebugLog", id, 0);
	return promise;
}

export async function DebugWorldText(
	pMessage: string,
	hEntity: Ent,
	nTextOffset: number,
	flDuration: number,
	flVerticalOffset: number,
	color: Vector3,
	flAlpha: number,
	flScale: number
): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DebugWorldText", id, 0);
	let s: Array<number> = (await promise).map((v: string) => Number(v));
	return promise;
}

export async function DebugScreenText(
	pMessage: string,
	flScreenX: number,
	flScreenY: number,
	nTextOffset: number,
	flDuration: number,
	color: Vector3,
	flAlpha: number
): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DebugScreenText", id, 0);
	let s: Array<number> = (await promise).map((v: string) => Number(v));
	return promise;
}

export async function DebugWorldSphere(vPos: Vector3, flRadius: number, flDuration: number, color: Vector3, flAlpha: number): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DebugWorldSphere", id, 0);
	let s: Array<number> = (await promise).map((v: string) => Number(v));
	return promise;
}

export async function DebugWorldEntityAxis(hEntity: string, flAxisLength: number, flDuration: number): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DebugWorldEntityAxis", id, 0);
	let s: Array<number> = (await promise).map((v: string) => Number(v));
	return promise;
}

export async function DebugWorldAxis(vPos: string, flAxisLength: number, flDuration: number): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DebugWorldAxis", id, 0);
	let s: Array<number> = (await promise).map((v: string) => Number(v));
	return promise;
}

export async function DebugWorldCross(vPos: Vector3, flRadius: number, flDuration: number, color: Vector3, flAlpha: number): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DebugWorldCross", id, 0);
	let s: Array<number> = (await promise).map((v: string) => Number(v));
	return promise;
}

export async function DebugWorldLine(vStartPos: Vector3, vEndPos: Vector3, flDuration: number, color: Vector3, flAlpha: number): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DebugWorldLine", id, 0);
	let s: Array<number> = (await promise).map((v: string) => Number(v));
	return promise;
}

export async function DebugWorldArrow(vStartPos: Vector3, vEndPos: Vector3, flDuration: number, color: Vector3, flWidth: number, flAlpha: number): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DebugWorldArrow", id, 0);
	let s: Array<number> = (await promise).map((v: string) => Number(v));
	return promise;
}

export async function FindEntityByName(name: string): Promise<Ent | undefined> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", name, 0);
	Instance.EntFireBroadcast("pulse", "FindEntityByName", id, 0);
	let s = (await promise)[0];
	return s == "-1" ? undefined : (s as Ent);
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

export async function DealDamage(entTarget: Ent, entAttacker: Ent, dmg: number, force: Vector3): Promise<void> {
	let [promise, id] = createDeferred<void>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DealDamage", id, 0);
	return promise;
}
/**
 *
 * @param vStartPos
 * @param vDirection
 * @param fMaxLength
 * @param hIgnoreEntity
 * @param nTraceContents 0: Static Level, 1: Solid
 * @returns
 */
export async function GetTraceHit(
	vStartPos: Vector3,
	vDirection: Vector3,
	fMaxLength: number,
	hIgnoreEntity: Ent,
	nTraceContents: number
): Promise<{
	didHit: boolean;
	distance: number;
	location: Vector3;
	normal: Vector3;
	fraction: number;
	entity: Ent;
}> {
	let [promise, id] = createDeferred<void>();
	nTraceContents = Math.min(Math.max(nTraceContents, 0), 1);
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "GetTraceHit", id, 0);
	let results = await promise;
	//Instance.Msg(results);
	return {
		didHit: str2Bool(results[0]),
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

export async function PointTemplate_ForceSpawn(entTemplate: Ent, entLocation: Ent): Promise<Array<Ent>> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "PointTemplateForceSpawn", id, 0);
	return (await promise) as Array<Ent>;
}

// Use EntFireByHandle instead
// export async function EntFirePlayerPawn(entPlayer: Ent, input: string, param: string) : Promise<void>{
// 	let [promise, id] = createDeferred<Array<string>>();
// 	SetParam(Array.from(arguments));
// 	Instance.EntFireBroadcast("pulse", "EntFirePlayerPawn", id, 0);
// 	return promise;
// }

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

export async function AreEntitiesInHierarchy(ent1: Ent, ent2: Ent): Promise<boolean> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "AreEntitiesInHierarchy", id, 0);
	return str2Bool((await promise)[0]);
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

export async function FindAllEntitiesWithinRadius(entityType: string, searchEnt: Ent, searchRadius: number, sorted: boolean, includeNonPhysical: boolean): Promise<Array<Ent>> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "FindAllEntitiesWithinRadius", id, 0);
	return (await promise) as Array<Ent>;
}
/**
 * Uses OnUser4
 */
export async function EntFireByHandle(ent: Ent, input: string, param: string): Promise<void> {
	if (input.toLowerCase() == "addoutput") {
		return await AddOutputByHandle(ent, param);
	}
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "EntFireByHandle", id, 0);
	return promise;
}

/**
 * EntFire where input is addoutput
 */
export async function AddOutputByHandle(ent: Ent, param: string): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "AddOutputByHandle", id, 0);
	return promise;
}

export async function EntFireAsPlayer(entName: string, input: string, param: string, activator: Ent): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	await EntFireByHandle(activator, "AddContext", "pulssy:1");
	Instance.EntFireBroadcast("pulssy_filter", "AddOutput", `OnPass>ts>ResolveID>${id}>0>1`, 0);
	Instance.EntFireBroadcast("pulssy_filter", "AddOutput", "OnPass>!activator>RemoveContext>pulssy>0>1", 0);
	Instance.EntFireBroadcast("pulssy_filter", "AddOutput", `OnPass>${entName}>${input}>${param}>0>1`, 0);
	Instance.EntFireBroadcast("pulssy_zone", "CountPlayersInZone", "", 0);
	return promise;
}
/**
 * Spawn a point_orient that follow the player's look direction
 *
 * Becomes active after one tick
 */
export async function MakeEye(entPlayer: Ent): Promise<Ent | undefined> {
	let template = await FindEntityByName("pulssy_eyeangle_temp");
	if (!template) {
		return undefined;
	}
	let eye = (await PointTemplate_ForceSpawn(template, template))[0];
	EntFireAsPlayer(await GetName(eye), "SetTarget", "!activator", entPlayer);
	return eye;
}

export async function DoesEntityHaveLOS(ent: Ent, entTarget: Ent): Promise<boolean> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DoesEntityHaveLOS", id, 0);
	return str2Bool((await promise)[0]);
}

export async function GetEntityFacingYawAngleDelta(ent: Ent, entTarget: Ent): Promise<number> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "GetEntityFacingYawAngleDelta", id, 0);
	return Number((await promise)[0]);
}

export async function CanCharacterSeeEntity(entChar: Ent, entTarget: Ent): Promise<boolean> {
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "GetEntityFacingYawAngleDelta", id, 0);
	return str2Bool((await promise)[0]);
}

export async function GetEntityHeightAboveNavMesh(ent: Ent): Promise<number> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetEntityHeightAboveNavMesh", id, 0);
	return Number((await promise)[0]);
}

export async function ConCommand(command: string): Promise<void> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", command, 0);
	Instance.EntFireBroadcast("pulse", "ConCommand", id, 0);
	return;
}

export async function GetEntityNavMeshPosition(ent: Ent): Promise<Vector3> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetEntityNavMeshPosition", id, 0);
	return Vector3.fromString((await promise)[0]);
}

export async function GetEntityHeightAboveWorldCollision(ent: Ent): Promise<number> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetEntityHeightAboveWorldCollision", id, 0);
	return Number((await promise)[0]);
}

export async function GetMatchInfo(): Promise<{ RoundsPlayedThisPhase: number; CTScore: number; TScore: number; ScoreToEndMatch: number }> {
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "GetMatchInfo", id, 0);
	let s: Array<number> = (await promise).map((v: string) => Number(v));
	return { RoundsPlayedThisPhase: s[0], CTScore: s[1], TScore: s[2], ScoreToEndMatch: s[3] };
}
