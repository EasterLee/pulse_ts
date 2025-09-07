import { Instance } from "cspointscript"
import * as Pulse from "./pulse_helper"

Instance.PublicMethod("Test1", async () => {
	Instance.Msg("Start DebugLog");
	await Pulse.DebugLog("Hello from Pulse");
	let ent = await Pulse.FindByName("ts");
	Instance.Msg(await Pulse.GetName(ent));
	Instance.Msg(await Pulse.GetClassname(ent));
	await Pulse.SetOrigin(ent, [1, 2, 3]);
	Instance.Msg(await Pulse.GetAbsOrigin(ent));
	await Pulse.SetOrigin(ent, [123, 456, 789]);
	Instance.Msg(await Pulse.GetAbsOrigin(ent));
	let entites = await Pulse.FindAllEntities("player");
	//array.forEach doesn't like await
	for (const ent of entites) {
		await Pulse.EntFirePlayerPawn(ent, "SetHealth", "1");
	}
	Instance.Msg("End DebugLog");
})