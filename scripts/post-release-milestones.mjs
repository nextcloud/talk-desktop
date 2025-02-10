/*
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const { blue, green, yellow, gray, red } = chalk

const confirm = async (message) => {
	if (!argv.y && await question(yellow(`${message} (y/N)`)) !== 'y') {
		process.exit(0)
	}
}

if (os.platform() === 'win32') {
	usePwsh()
}

// Verify that GitHub CLI is available and authenticated
await $`gh auth status`

/********
 * Help *
 ********/

if (argv.help) {
	echo`Update milestones after the release:
	1. Renames the current milestone to the release milestone (Next Release -> v1.2.3)
	2. Creates the next milestone as a replacement for the current (Next Release)
	3. Moves all open issues and PRs from the current=release milestone to the new milestone (v1.2.3 -> Next Release)
	4. Closes the current=release milestone

USAGE:
	npm run post-release:milestones
	npm run post-release:milestones -- -y --current="🪴 Next Release" --release="v1.2.3" --next="🌵 Next Release"

ARGS:
	--help - show help
	-y - skip confirmation
	--current - Optionally the current milestone to rename. Default is "🪴 Next Release".
	--release - Optionally the release version to rename the source milestone to. Default is the v + package.json version.
	--next - Optionally the new milestone to create. Default is --source, which is "🪴 Next Release".
`
	process.exit(0)
}

// Read the package.json
const packageJson = await fs.readJson(path.join(__dirname, '../package.json'))
// Read args with defaults
const currentMilestone = argv.current ?? '🪴 Next Release'
const releaseMilestone = argv.release ?? 'v' + packageJson.version
const nextMilestone = argv.next ?? currentMilestone

const { nameWithOwner, milestones } = await $`gh repo view --json nameWithOwner,milestones`.json()
echo(blue(`Maintain milestones after a release in ${nameWithOwner}`))

/**************************************
 * 1. Rename (Next Release -> v1.2.3) *
 **************************************/

const existingCurrentMilestone = milestones.find((milestone) => milestone.title === currentMilestone)
const existingReleaseMilestone = milestones.find((milestone) => milestone.title === releaseMilestone)

echo`1. Renaming milestone '${blue(currentMilestone)}' to '${blue(releaseMilestone)}'`
if (existingReleaseMilestone) {
	echo(yellow(`   Skipping: milestone '${blue(releaseMilestone)}' already exists`))
} else if (existingCurrentMilestone) {
	await confirm(`   Rename milestone '${blue(currentMilestone)}' to '${blue(releaseMilestone)}'?`)
	await $`gh api 'repos/{owner}/{repo}/milestones/${existingCurrentMilestone.number}' --method PATCH --field title=${releaseMilestone}`
	existingCurrentMilestone.title = releaseMilestone
	echo(green(`   Renamed milestone '${blue(currentMilestone)}' to '${blue(releaseMilestone)}'`))
} else {
	echo(red(`Error: neither milestone '${blue(currentMilestone)}' nor '${blue(releaseMilestone)}' exist`))
	process.exit(1)
}

/********************************
 * 2. Create new 'Next Release' *
 ********************************/

const existingNextMilestone = milestones.find((milestone) => milestone.title === nextMilestone)

echo`2. Create a new milestone '${blue(nextMilestone)}'`
if (existingNextMilestone) {
	echo(yellow(`   Skipping: the next milestone '${blue(nextMilestone)}' already exists`))
} else {
	await confirm(`   Create a new milestone '${blue(nextMilestone)}'?`)
	await $`gh api '/repos/{owner}/{repo}/milestones' --method POST --field title=${nextMilestone}`
	echo(green(`   Created a new milestone '${blue(nextMilestone)}'`))
}

/******************************************
 * 3. Move items (v1.2.3 -> Next Release) *
 ******************************************/

echo`3. Moving all issues and PRs to ${blue(nextMilestone)}`

const issues = await $`gh issue list --state=open --milestone=${releaseMilestone} --json=number,title --limit=1000`.json()
const prs = await $`gh pr list --state=open --search='milestone:"${releaseMilestone}"' --json=number,title --limit=1000`.json()
echo(gray(`   Found ${issues.length} issues and ${prs.length} PRs:`))
echo(gray(prs.map((pr) => `   - PR #${pr.number}: ${pr.title}`).join('\n')))
echo(gray(issues.map((issue) => `   - Issue #${issue.number}: ${issue.title}`).join('\n')))

await confirm(`   Move ${issues.length + prs.length} items to '${blue(nextMilestone)}'?`)
// Sleep for a bit to avoid rate limiting (90 requests per minute)
await spinner(yellow('   Moving...'), async () => {
	for (const issue of issues) {
		await $`gh issue edit ${issue.number} --milestone=${nextMilestone}`
		await sleep(100)
	}
	for (const pr of prs) {
		await $`gh pr edit ${pr.number} --milestone=${nextMilestone}`
		await sleep(100)
	}
})
echo(green(`    ${issues.length + prs.length} items moved to '${blue(nextMilestone)}'`))

/*******************************
 * 4. Close milestone (v1.2.3) *
 *******************************/

echo`4. Closing milestone '${blue(releaseMilestone)}'`
await confirm(`   Close milestone '${blue(releaseMilestone)}'?`)
await $`gh api 'repos/{owner}/{repo}/milestones/${existingReleaseMilestone.number}' --method PATCH --field state=closed`
echo(green(`   Closed milestone '${releaseMilestone}'`))
