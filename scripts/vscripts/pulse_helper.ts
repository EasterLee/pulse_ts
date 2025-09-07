import { Instance } from "cspointscript"

const callMap = new Map<string, Deferred<any>>();

type Deferred<T> = {
	promise: Promise<T | undefined>;
	resolve: (value?: T) => void;
};

export const NULL_ENT : PulseEID = "-1" as PulseEID;
type Vector3 = [number, number, number];

type PulseEID = string & { readonly __brand: unique symbol };

let idCount = 0;
function createDeferred<T>(): [Promise<any>, string] {
	let resolve!: (value?: T) => void;

	const promise = new Promise<T | undefined>((res) => {
		resolve = res;
	});

	let id = (idCount++).toString();
	callMap.set(id, {promise, resolve});

	return [promise, id];
}

Instance.PublicMethod("ResolveID", (str : string) => {
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
})

function SetParam(p : (string | number | Vector3)[]) : void {

	const pushVec = function (vec : Vector3) : void {
		Instance.EntFireBroadcast("pulse", "pushParam", vec[0], 0);
		Instance.EntFireBroadcast("pulse", "pushParam", vec[1], 0);
		Instance.EntFireBroadcast("pulse", "pushParam", vec[2], 0);
	};

	Instance.EntFireBroadcast("pulse", "clearParam", "", 0);
	p.forEach(item =>{
		if (Array.isArray(item)) {
			pushVec(item as Vector3);
		} else {
			Instance.EntFireBroadcast("pulse", "pushParam", item, 0)
		}
	}
	);
}

function stringToVec3(str) : Vector3 {
	let arr = str.split(" ");
	return arr.map(s => Number(s));
}

export async function DebugLog(str: string) : Promise<void>{
	let [promise, id] = createDeferred<void>();
	Instance.EntFireBroadcast("pulse", "str1", str, 0);
	Instance.EntFireBroadcast("pulse", "DebugLog", id, 0);
	return promise;
}

export async function FindByName(name: string) : Promise<PulseEID>{
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", name, 0);
	Instance.EntFireBroadcast("pulse", "FindPulseEIDByName", id, 0);
	return (await promise)[0] as PulseEID;
}

export async function GetName(ent: PulseEID) : Promise<string>{
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetName", id, 0);
	return (await promise)[0];
}

export async function GetClassname(ent: PulseEID) : Promise<string>{
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetClassname", id, 0);
	return (await promise)[0];
}

export async function GetAbsOrigin(ent: PulseEID) : Promise<Vector3>{
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetAbsOrigin", id, 0);
	return stringToVec3((await promise)[0]);
}

export async function SetOrigin(ent: PulseEID, v: Vector3) : Promise<void>{
	let [promise, id] = createDeferred<void>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "SetOrigin", id, 0);
	return promise;
}

export async function AddVelocity(ent: PulseEID, v: Vector3) : Promise<void>{
	let [promise, id] = createDeferred<void>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "AddVelocity", id, 0);
	return promise;
}

export async function GetForward(ent: PulseEID) : Promise<Vector3>{
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetForward", id, 0);
	return stringToVec3((await promise)[0]);
}

export async function DealDamage(entTarget: PulseEID, entAttacker: PulseEID, dmg: number, force: Vector3) : Promise<void>{
	let [promise, id] = createDeferred<void>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "DealDamage", id, 0);
	return promise;
}

export async function GetTraceHit(vStartPos : Vector3, vDirection : Vector3, fMaxLength : number, hIgnoreEntity : PulseEID) : Promise<{didHit: boolean, distance: number, location: Vector3, normal: Vector3, fraction: number, entity: PulseEID}>{
	let [promise, id] = createDeferred<void>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "GetTraceHit", id, 0);
	let results = await promise;
	//Instance.Msg(results);
	return {didHit: Boolean(results[0]), distance: Number(results[1]), location: stringToVec3(results[2]), normal: stringToVec3(results[3]), fraction: Number(results[4]), entity: results[5] as PulseEID};
}

export async function RemoveEntity(ent: PulseEID) : Promise<void>{
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "RemoveEntity", id, 0);
	return promise;
}

export async function PointTemplate_ForceSpawn(entTemplate: PulseEID, entLocation: PulseEID) : Promise<Array<PulseEID>>{
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "PointTemplateForceSpawn", id, 0);
	return (await promise) as Array<PulseEID>;
}

export async function EntFirePlayerPawn(entPlayer: PulseEID, input: string, param: string) : Promise<void>{
	let [promise, id] = createDeferred<Array<string>>();
	SetParam(Array.from(arguments));
	Instance.EntFireBroadcast("pulse", "EntFirePlayerPawn", id, 0);
	return promise;
}

export async function Wait(delay: number) : Promise<void>{
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("ts", "ResolveID", id, delay);
	return promise;
}

// broken?
export async function GetPlayerSlot(ent: PulseEID) : Promise<number>{
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetPlayerSlot", id, 0);
	return Number((await promise)[0]);
}

export async function GetParent(ent: PulseEID) : Promise<PulseEID>{
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", ent, 0);
	Instance.EntFireBroadcast("pulse", "GetParent", id, 0);
	return (await promise)[0] as PulseEID;
}

export async function FindAllEntities(entityType: string) : Promise<Array<PulseEID>>{
	let [promise, id] = createDeferred<Array<string>>();
	Instance.EntFireBroadcast("pulse", "str1", entityType, 0);
	Instance.EntFireBroadcast("pulse", "FindAllEntity", id, 0);
	return (await promise) as Array<PulseEID>;
}