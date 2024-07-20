if not IsDuplicityVersion() then return end

local config = lib.load('config')

function GetPlayerJob(identifier, job)
    local result = MySQL.Sync.fetchAll('SELECT * FROM save_jobs WHERE cid = ? AND job = ? and grade = ?', { identifier, job.name, job.grade })
    if result[1] then
        return result[1]
    end
    return nil
end

function GetPlayerJobs(identifier)
    return MySQL.Sync.fetchAll('SELECT * FROM save_jobs WHERE cid = ?', { identifier })
end

function SortPlayerJobs(identifier)
    local result = GetPlayerJobs(identifier)
    local storeJobs = {}
    for _, v in pairs(result) do
        local job = JOBS[v.job]

        if not job then
            return error(('MISSING JOB FROM jobs.lua: "%s" | CITIZEN ID: %s'):format(v.job, identifier))
        end

        local grade = job.grades[tostring(v.grade)]

        if not grade then
            return error(('MISSING JOB GRADE for "%s". GRADE MISSING: %s | CITIZEN ID: %s'):format(v.job, v.grade, identifier))
        end

        storeJobs[#storeJobs + 1] = {
            job = v.job,
            salary = grade.payment,
            jobLabel = job.label,
            gradeLabel = grade.name,
            grade = v.grade,
        }
    end
    return storeJobs
end

function GetPlayerJobCount(identifier)
    local result = MySQL.Sync.await('SELECT COUNT(*) as count FROM save_jobs WHERE cid = ?', { identifier })
    if result[1] then
        return result[1].count >= config.maxJobs
    end
    return false
end

function AddPlayerJob(identifier, job, grade)
    return MySQL.Sync.await('INSERT INTO save_jobs (cid, job, grade) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE grade = VALUES(grade)', { identifier, job, grade })
end

function DeletePlayerJob(identifier, job)
    return MySQL.Sync.await('DELETE FROM save_jobs WHERE cid = ? AND job = ?', { identifier, job })
end