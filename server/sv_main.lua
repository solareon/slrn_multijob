lib.versionCheck('solareon/slrn_multijob')

if not lib.checkDependency('qbx_core', '1.7.0') then error() end

if GetCurrentResourceName() ~= 'slrn_multijob' then
    lib.print.error('The resource needs to be named ^5slrn_multijob^7.')
    return
end

local function canSetJob(player, jobName)
    local jobs = player.PlayerData.jobs
    for job, _ in pairs(jobs) do
        if job == jobName then
            return true
        end
    end
    return false
end

lib.callback.register('slrn_multijob:server:changeJob', function(source, job)
    local player = exports.qbx_core:GetPlayer(source)

    if player.PlayerData.job.name == job then
        exports.qbx_core:Notify(source, 'Your current job is already set to this.', 'error')
        return
    end

    local jobInfo = exports.qbx_core:GetJob(job)
    if not jobInfo then
        exports.qbx_core:Notify(source, 'Invalid job.', 'error')
        return
    end

    local cid = player.PlayerData.citizenid
    local canSet = canSetJob(player, job)

    if not canSet then return end

    exports.qbx_core:SetPlayerPrimaryJob(cid, job)
    exports.qbx_core:Notify(source, ('Your job is now: %s'):format(jobInfo.label))
    player.Functions.SetJobDuty(false)
    return true
end)

lib.callback.register('slrn_multijob:server:deleteJob', function(source, job)
    local player = exports.qbx_core:GetPlayer(source)
    local jobInfo = exports.qbx_core:GetJob(job)

    if not jobInfo then
        exports.qbx_core:Notify(source, 'Invalid job.', 'error')
        return
    end

    exports.qbx_core:RemovePlayerFromJob(player.PlayerData.citizenid, job)
    exports.qbx_core:Notify(source, ('You deleted %s job from your menu.'):format(jobInfo.label))
    return true
end)



CreateThread(function()
    if GetConvar('qbx:setjob_replaces', 'true') == 'true' then
        lib.print.warn('The qbx:setjob_replaces^7 convar is set to true, this may cause issues with this resource. It is recommended to set it to false.')
    end
    if GetConvarInt('qbx:max_jobs_per_player', 1) == 1 then
        while true do
            lib.print.error('The qbx:max_jobs_per_player convar is set to 1, please increase it in your server.cfg to use this resource.')
            Wait(100)
        end
    end
end)