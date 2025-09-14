import { Instance } from "cspointscript";
import * as Pulse from "./pulse_helper";
import { Vector3 } from "./pulse_helper";

Pulse.OnRoundStart(async (nRoundNumber) => {
	Instance.Msg("Round Number: " + nRoundNumber);

	// Eye Trace
	let elite = await Pulse.FindEntityByName("test_elite1");
	if (elite) {
		await Pulse.ListenForOutput(elite, "OnPlayerPickup", true, async (self, activator) => {
			Instance.Msg("Elite Picked Up");

			const tick = 0.05;
			let eye = await Pulse.MakeEye(activator);
			if (!eye) return;
			while (1) {
				let forward = await Pulse.GetForward(eye);
				let origin = await Pulse.GetAbsOrigin(activator);
				origin.z += 64;
				let hit = await Pulse.GetTraceHit(origin, forward, 9999999, activator, 0);
				if (hit.didHit) await Pulse.DebugWorldArrow(hit.location, hit.location.add(hit.normal.scale(32)), tick + 0.01, new Vector3(255, 0, 0), 2, 1);
				await Pulse.Wait(tick);
			}
		});
	}
	// Button Filter
	let test_button = await Pulse.FindEntityByName("test_button");
	if (test_button) {
		await Pulse.ListenForOutput(test_button, "OnPressed", false, async (self, activator) => {
			if (await Pulse.AreEntitiesInHierarchy(self, activator)) {
				Instance.Msg("Is weapon holder");
				await Pulse.EntFireByHandle(self, "FireUser1", "");
			} else {
				Instance.Msg("Not weapon holder");
			}
		});
	}

	// Knife Stripper
	let trigger = await Pulse.FindEntityByName("knife_strip_trigger");
	if (trigger) {
		await Pulse.ListenForOutput(trigger, "OnStartTouch", false, async (self, activator) => {
			let knifes = await Pulse.FindAllEntitiesWithinRadius("weapon_knife", activator, 10, true, true);
			for (const knife of knifes) {
				if (await Pulse.AreEntitiesInHierarchy(knife, activator)) {
					await Pulse.RemoveEntity(knife);
					return;
				}
			}
		});
	}
});

Instance.PublicMethod("test", async () => {
	Instance.Msg("Initializing in ...");
	await Pulse.Wait(1);
	Instance.Msg("3");
	await Pulse.Wait(1);
	Instance.Msg("2");
	await Pulse.Wait(1);
	Instance.Msg("1");
	await Pulse.Wait(1);
	Instance.Msg("Start DebugLog");
	await Pulse.DebugLog("Hello from Pulse");
	let ent = await Pulse.FindEntityByName("ts");
	if (ent) {
		Instance.Msg(await Pulse.GetName(ent));
		Instance.Msg(await Pulse.GetClassname(ent));
		await Pulse.SetOrigin(ent, new Vector3(1, 2, 3));
		Instance.Msg(await Pulse.GetAbsOrigin(ent));
		await Pulse.SetOrigin(ent, new Vector3(123, 456, 789));
		Instance.Msg(await Pulse.GetAbsOrigin(ent));
	}
	await Pulse.DebugLog("Good Bye from Pulse");
	Instance.Msg("End DebugLog");
});
