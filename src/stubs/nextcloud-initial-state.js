/*
 * @copyright Copyright (c) 2022 Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @author Grigorii Shartsev <grigorii.shartsev@nextcloud.com>
 *
 * @license GNU AGPL version 3 or any later version
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

// TODO: FIXME: JUST MY COPY
const STUB = {
	spreed: {
		call_enabled: true,
		signaling_mode: 'external',
		sip_dialin_info: 'Germany: +49 711 / 25 29 77 14',
		grid_videos_limit: 19,
		grid_videos_limit_enforced: false,
		federation_enabled: false,
		start_conversations: true,
		circles_enabled: true,
		guests_accounts_enabled: true,
		read_status_privacy: 0,
		play_sounds: true,
		attachment_folder: '/Talk',
		attachment_folder_free_space: 750430371840,
		enable_matterbridge: false,
	},
	theming: {
		background: 'default',
		themingDefaultBackground: '',
		shippedBackgrounds: {
			'anatoly-mikhaltsov-butterfly-wing-scale.jpg': {
				attribution: 'Butterfly wing scale (Anatoly Mikhaltsov, CC BY-SA)',
				attribution_url: 'https://commons.wikimedia.org/wiki/File:%D0%A7%D0%B5%D1%88%D1%83%D0%B9%D0%BA%D0%B8_%D0%BA%D1%80%D1%8B%D0%BB%D0%B0_%D0%B1%D0%B0%D0%B1%D0%BE%D1%87%D0%BA%D0%B8.jpg',
				primary_color: '#A53C17',
			},
			'bernie-cetonia-aurata-take-off-composition.jpg': {
				attribution: 'Cetonia aurata take off composition (Bernie, Public Domain)',
				attribution_url: 'https://commons.wikimedia.org/wiki/File:Cetonia_aurata_take_off_composition_05172009.jpg',
				theming: 'dark',
				primary_color: '#56633D',
			},
			'dejan-krsmanovic-ribbed-red-metal.jpg': {
				attribution: 'Ribbed red metal (Dejan Krsmanovic, CC BY)',
				attribution_url: 'https://www.flickr.com/photos/dejankrsmanovic/42971456774/',
				primary_color: '#9C4236',
			},
			'eduardo-neves-pedra-azul.jpg': {
				attribution: 'Pedra azul milky way (Eduardo Neves, CC BY-SA)',
				attribution_url: 'https://commons.wikimedia.org/wiki/File:Pedra_Azul_Milky_Way.jpg',
				primary_color: '#4F6071',
			},
			'european-space-agency-barents-bloom.jpg': {
				attribution: 'Barents bloom (European Space Agency, CC BY-SA)',
				attribution_url: 'https://www.esa.int/ESA_Multimedia/Images/2016/08/Barents_bloom',
				primary_color: '#396475',
			},
			'hannes-fritz-flippity-floppity.jpg': {
				attribution: 'Flippity floppity (Hannes Fritz, CC BY-SA)',
				attribution_url: 'http://hannes.photos/flippity-floppity',
				primary_color: '#98415A',
			},
			'hannes-fritz-roulette.jpg': {
				attribution: 'Roulette (Hannes Fritz, CC BY-SA)',
				attribution_url: 'http://hannes.photos/roulette',
				primary_color: '#845334',
			},
			'hannes-fritz-sea-spray.jpg': {
				attribution: 'Sea spray (Hannes Fritz, CC BY-SA)',
				attribution_url: 'http://hannes.photos/sea-spray',
				primary_color: '#4F6071',
			},
			'kamil-porembinski-clouds.jpg': {
				attribution: 'Clouds (Kamil Porembiński, CC BY-SA)',
				attribution_url: 'https://www.flickr.com/photos/paszczak000/8715851521/',
				primary_color: '#0082C9',
			},
			'bernard-spragg-new-zealand-fern.jpg': {
				attribution: 'New zealand fern (Bernard Spragg, CC0)',
				attribution_url: 'https://commons.wikimedia.org/wiki/File:NZ_Fern.(Blechnum_chambersii)_(11263534936).jpg',
				primary_color: '#316B26',
			},
			'rawpixel-pink-tapioca-bubbles.jpg': {
				attribution: 'Pink tapioca bubbles (Rawpixel, CC BY)',
				attribution_url: 'https://www.flickr.com/photos/byrawpixel/27665140298/in/photostream/',
				theming: 'dark',
				primary_color: '#7B4E7E',
			},
			'nasa-waxing-crescent-moon.jpg': {
				attribution: 'Waxing crescent moon (NASA, Public Domain)',
				attribution_url: 'https://www.nasa.gov/image-feature/a-waxing-crescent-moon',
				primary_color: '#005AC1',
			},
			'tommy-chau-already.jpg': {
				attribution: 'Cityscape (Tommy Chau, CC BY)',
				attribution_url: 'https://www.flickr.com/photos/90975693@N05/16910999368',
				primary_color: '#6A2AF4',
			},
			'tommy-chau-lion-rock-hill.jpg': {
				attribution: 'Lion rock hill (Tommy Chau, CC BY)',
				attribution_url: 'https://www.flickr.com/photos/90975693@N05/17136440246',
				theming: 'dark',
				primary_color: '#7F4F70',
			},
			'lali-masriera-yellow-bricks.jpg': {
				attribution: 'Yellow bricks (Lali Masriera, CC BY)',
				attribution_url: 'https://www.flickr.com/photos/visualpanic/3982464447',
				theming: 'dark',
				primary_color: '#7F5700',
			},
		},
		data: {
			name: 'Nextcloud',
			url: 'https://nextcloud.com',
			slogan: 'a safe home for all your data',
			color: '#0082C9',
			defaultColor: '#0082C9',
			imprintUrl: '',
			privacyUrl: '',
			inverted: false,
			cacheBuster: 'c52b97d1',
			enabledThemes: ['light'],
		},
		shortcutsDisabled: false,
	},
	core: {
		apps: {
			dashboard: {
				id: 'dashboard',
				order: '-1',
				href: '/apps/dashboard/',
				icon: '/apps/dashboard/img/dashboard.svg',
				type: 'link',
				name: 'Dashboard',
				active: false,
				classes: '',
				unread: 0,
			},
			files: {
				id: 'files',
				order: '0',
				href: '/apps/files/',
				icon: '/apps/files/img/app.svg',
				type: 'link',
				name: 'Files',
				active: false,
				classes: '',
				unread: 0,
			},
			photos: {
				id: 'photos',
				order: '1',
				href: '/apps/photos/',
				icon: '/apps/photos/img/app.svg',
				type: 'link',
				name: 'Photos',
				active: false,
				classes: '',
				unread: 0,
			},
			activity: {
				id: 'activity',
				order: '1',
				href: '/apps/activity/',
				icon: '/apps/activity/img/activity.svg',
				type: 'link',
				name: 'Activity',
				active: false,
				classes: '',
				unread: 0,
			},
			spreed: {
				id: 'spreed',
				name: 'Talk',
				href: 'https://cloud.nextcloud.com/apps/spreed/',
				icon: '/apps/spreed/img/app.svg',
				order: 3,
				type: 'link',
				active: true,
				classes: '',
				unread: 0,
			},
			mail: {
				id: 'mail',
				order: '3',
				href: '/apps/mail/',
				icon: '/apps/mail/img/mail.svg',
				type: 'link',
				name: 'Mail',
				active: false,
				classes: '',
				unread: 0,
			},
			zammad_organisation_management: {
				id: 'zammad_organisation_management',
				order: '4',
				href: '/apps/zammad_organisation_management/',
				icon: '/apps/zammad_organisation_management/img/app.svg',
				type: 'link',
				name: 'Customers',
				active: false,
				classes: '',
				unread: 0,
			},
			contacts: {
				id: 'contacts',
				order: '4',
				href: '/apps/contacts/',
				icon: '/apps/contacts/img/app.svg',
				type: 'link',
				name: 'Contacts',
				active: false,
				classes: '',
				unread: 0,
			},
			calendar: {
				id: 'calendar',
				order: '5',
				href: '/apps/calendar/',
				icon: '/apps/calendar/img/calendar.svg',
				type: 'link',
				name: 'Calendar',
				active: false,
				classes: '',
				unread: 0,
			},
			integration_github: {
				id: 'integration_github',
				order: 10,
				href: 'https://github.com',
				target: '_blank',
				icon: '/apps/integration_github/img/app.svg',
				name: 'GitHub',
				active: false,
				classes: '',
				type: 'link',
				unread: 0,
			},
			notes: {
				id: 'notes',
				order: '10',
				href: '/apps/notes/',
				icon: '/apps/notes/img/notes.svg',
				type: 'link',
				name: 'Notes',
				active: false,
				classes: '',
				unread: 0,
			},
			deck: {
				id: 'deck',
				order: '10',
				href: '/apps/deck/',
				icon: '/apps/deck/img/deck.svg',
				type: 'link',
				name: 'Deck',
				active: false,
				classes: '',
				unread: 0,
			},
			announcementcenter: {
				id: 'announcementcenter',
				order: '10',
				href: '/apps/announcementcenter/',
				icon: '/apps/announcementcenter/img/announcementcenter.svg',
				type: 'link',
				name: 'Announcements',
				active: false,
				classes: '',
				unread: 0,
			},
			collectives: {
				id: 'collectives',
				order: '12',
				href: '/apps/collectives',
				icon: '/apps/collectives/img/collectives.svg',
				type: 'link',
				name: 'Collectives',
				active: false,
				classes: '',
				unread: 0,
			},
			forms: {
				id: 'forms',
				order: '77',
				href: '/apps/forms/',
				icon: '/apps/forms/img/forms.svg',
				type: 'link',
				name: 'Forms',
				active: false,
				classes: '',
				unread: 0,
			},
			tasks: {
				id: 'tasks',
				order: '100',
				href: '/apps/tasks/',
				icon: '/apps/tasks/img/tasks.svg',
				type: 'link',
				name: 'Tasks',
				active: false,
				classes: '',
				unread: 0,
			},
		},
		projects_enabled: false,
		config: {
			session_lifetime: 1440,
			session_keepalive: true,
			auto_logout: false,
			version: '25.0.2.3',
			versionstring: '25.0.2',
			enable_avatars: true,
			lost_password_link: null,
			modRewriteWorking: true,
			'sharing.maxAutocompleteResults': 25,
			'sharing.minSearchStringLength': 0,
			blacklist_files_regex: '\\.(part|filepart)$',
			loglevel: 2,
		},
	},
	user_status: {
		status: {
			userId: 'grigorii',
			message: null,
			messageId: null,
			messageIsPredefined: false,
			icon: null,
			clearAt: null,
			status: 'online',
			statusIsUserDefined: false,
		},
		profileEnabled: { profileEnabled: true },
	},
}

export function loadState(app, key, fallback) {
	const elem = STUB[app][key]
	if (elem === null) {
		if (fallback !== undefined) {
			return fallback
		}
		throw new Error('Could not find initial state '.concat(key, ' of ').concat(app))
	}

	return elem
}
