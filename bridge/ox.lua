if GetResourceState('ox_core') ~= 'started' then return end

local isServer = IsDuplicityVersion()

local Ox = require '@ox_core.lib.init'

--TODO: Add ox_core support

