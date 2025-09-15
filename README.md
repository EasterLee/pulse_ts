# pulse_ts

***Experimental*** helper library that allow source_ts to communicate with pulse.


## You will need these to compile pulse and source_ts

[Unofficial Pulse graph editor](https://github.com/LionDoge/vpulse-editor)

[Unofficial Source_TS compiler](https://github.com/Peterclark1996/s2ts) 

## Examples
Check main.ts. Required entities and example usages are in pulse_ts.vmap.


## Currently exported function
### Debug
- DebugLog
- DebugWorldText
- DebugScreenText
- DebugWorldSphere
- DebugWorldEntityAxis
- DebugWorldAxis
- DebugWorldCross
- DebugWorldLine
- DebugWorldArrow
### Entity
  #### Find Entities
  - FindEntityByName
  - FindAllEntities
  - FindAllEntitiesWithinRadius
  #### Entity
  - GetName
  - GetClassname
  - GetAbsOrigin
  - GetForward
  - GetParent
  - AreEntitiesInHierarchy
  - GetTeamNumber
  - DoesEntityHaveLOS
  - GetEntityFacingYawAngleDelta
  - GetEntityHeightAboveNavMesh
  - GetEntityNavMeshPosition
  - GetEntityHeightAboveWorldCollision
  - SetOrigin
  - AddVelocity
  - RemoveEntity
  - PointTemplate_ForceSpawn
### Misc
  - CanCharacterSeeEntity
  - DealDamage
  - GetTraceHit
  - Wait
  - GetMatchInfo
  - ConCommand
### Custom Implementation
#### Some of these functions use OnUser4/FireUser4 to work around a certain limitation
  - EntFireByHandle
    -  Uses OnUser4/FireUser4 on ent
  - EntFireAsPlayer
    -  EntFireByName but with activator, uses OnUser4/FireUser4 on activator
  - MakeEye
    -  Force spawn a point_orient that follow the player's look direction, uses OnUser4/FireUser4 on player
  - ListenForOutput
    -  Listen for output with self/activator support
