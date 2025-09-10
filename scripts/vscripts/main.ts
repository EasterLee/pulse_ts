import { Instance } from "cspointscript";
import * as Pulse from "./pulse_helper";
import { Vector3 } from "./pulse_helper";

Instance.PublicMethod("test", async () => {
	Instance.Msg("Start DebugLog");
	await Pulse.DebugLog("Hello from Pulse");
	let ent = await Pulse.FindEntityByName("ts");
	Instance.Msg(await Pulse.GetName(ent));
	Instance.Msg(await Pulse.GetClassname(ent));
	await Pulse.SetOrigin(ent, new Vector3(1, 2, 3));
	Instance.Msg(await Pulse.GetAbsOrigin(ent));
	await Pulse.SetOrigin(ent, new Vector3(123, 456, 789));
	Instance.Msg(await Pulse.GetAbsOrigin(ent));
	Instance.Msg("End DebugLog");

	// example usages for output listener
	// await Pulse.ListenForOutput(await Pulse.FindEntityByName("trigger_green"), "OnStartTouch", async (self, activator) => {
	// 	let entites = await Pulse.FindAllEntitiesWithinRadius("weapon_knife", activator, 64, true, true);
	// 	for (const ent of entites) {
	// 		if (await Pulse.AreEntitiesInHierarchy(ent, activator)) {
	// 			await Pulse.EntFireByHandle(ent, "Kill", "");
	// 			return;
	// 		}
	// 	}
	// });
});
