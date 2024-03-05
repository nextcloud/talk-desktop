/*
 * @copyright Copyright (c) 2024 Grigorii Shartsev <me@shgk.me>
 *
 * @author Grigorii Shartsev <me@shgk.me>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import fs from 'node:fs'
import { $ } from 'zx'

export class TalkRepositoryUtils {

	static TALK_REPOSITORY_URL = 'https://github.com/nextcloud/spreed.git'

	#root
	#gitDir

	constructor(rootPath = './.spreed') {
		this.#root = rootPath
		this.#gitDir = `${rootPath}/.git`
	}

	/**
	 * @param {string} name
	 * @return {string}
	 */
	getPathForWorktree(name) {
		return `${this.#root}/${name}`
	}

	git(command, worktree) {
		if (worktree === undefined) {
			return $`git --git-dir=${this.#gitDir} ${command}`
		}
		return $`git --git-dir=${this.#gitDir} --work-tree=${this.getPathForWorktree(worktree)} ${command}`
	}

	/**
	 * @return {boolean}
	 */
	isInit() {
		return fs.existsSync(this.#gitDir)
	}

	/**
	 * Treeless bare clone to .git if not cloned already
	 * @return {this}
	 */
	init() {
		if (this.isInit()) {
			return this
		}
		$`git clone --bare --filter=tree:0 ${[TalkRepositoryUtils.TALK_REPOSITORY_URL, this.#gitDir]}`
		return this
	}

	/**
	 * @param {string} name
	 * @return {boolean}
	 */
	hasWorktree(name) {
		return fs.existsSync(this.getPathForWorktree(name))
	}

	/**
	 * @param {string} name
	 * @return {Promise<`refs/heads/${string}`|`refs/tags/${string}`>}
	 */
	async getRef(name) {
		const isValidRef = async (ref) => (await this.git(['show-ref', '--verify', ref]).quiet().nothrow()).exitCode === 0

		let ref = `refs/heads/${name}`
		if (await isValidRef(ref)) {
			return ref
		}

		ref = `refs/tags/${name}`
		if (await isValidRef(ref)) {
			return ref
		}

		throw new Error(`Cannot find ref for ${name}`)
	}

	async checkForUpdates(name) {
		const ref = await this.getRef(name)
		const result = await this.fetch(ref).quiet()
		const revParse = async (ref) => (await this.git(['rev-parse', ref])).stdout
		return await revParse(`FETCH_HEAD`) !== await revParse(ref)
	}

	fetch(name) {
		return this.git(['fetch', 'origin', name])
	}

	addWorktree(name) {
		if (this.hasWorktree(name)) {
			return this
		}
		this.git(['worktree', 'add', this.getPathForWorktree(name), name])
		return this
	}

	removeWorktree(name) {
		if (!this.hasWorktree(name)) {
			return this
		}
		this.git(['worktree', 'remove', this.getPathForWorktree(name)])
		return this
	}

	pull(name) {
		this.git(['pull'], name)
	}

	clean() {
		fs.unlinkSync(this.#root)
	}
}

const talkUtils = new TalkRepositoryUtils()

const result = await talkUtils.init().addWorktree('v18.0.4')
