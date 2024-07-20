lib.versionCheck('solareon/slrn_multijob')

if GetCurrentResourceName() ~= 'slrn_multijob' then
    lib.print.error('The resource needs to be named ^5slrn_multijob^7.')
    return
end

RegisterNetEvent('slrn_multijob:server:changeJob', function(job)
    local src = source
    if CheckCurrentJob(src, job) then
        Notify(src, 'Your current job is already set to this.', 'error')
        return
    end

    if not JOBS[job] then
        Notify(src, 'Invalid job.', 'error')
        return
    end

    if not CanSetJob(src, job) then return end

    SetPlayerJob(src, job)
    Notify(src, ('Your job is now: %s'):format(JOBS[job].label))
    SetPlayerDuty(false)
    return true
end)

RegisterNetEvent('slrn_multijob:server:deleteJob', function(job)
    local src = source

    if not JOBS[job] then
        Notify(src, 'Invalid job.', 'error')
        return
    end

    RemovePlayerFromJob(src, job)
    Notify(src, ('You deleted %s job from your menu.'):format(JOBS[job].label))
end)
