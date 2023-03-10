import { json } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

import { mainUser, groups, massagesCreate } from '$db/collections'
import { ObjectId } from 'mongodb'

export const load = (async ({ params }) => {
	const { user, HASHID } = params
	const latestMessages: any = []

	if (user) {
		const findUser = await mainUser.findOne({ _id: new ObjectId(user) })
		console.log(findUser)
		if (findUser) {
			const findGroup = await groups.findOne({ _id: new ObjectId(HASHID) })
			if (findGroup) {
				// const findUserLink = await mainUser.findOne({ _id: findUser._id, allGroups: findGroup._id })
				const findUserLink = await mainUser.findOne({ _id: findUser._id, allGroups: { $in: [findGroup._id] } })

				if (!findUserLink) {
					// await mainUser.updateOne({ _id: findUser._id }, { $push: { allGroups: findGroup._id } })
					await mainUser.updateOne({ _id: findUser._id }, { $addToSet: { allGroups: findGroup._id } })
				}

				if (findGroup) {
					const returnMsgData = await massagesCreate
						.aggregate([
							{ $match: { group_id: findGroup._id } },
							{
								$project: {
									_id: 1,
									message: 1,
									createdAt: 1,
									sender: 1,
								},
							},
						])
						.sort({ createdAt: -1 })
						.limit(10)
						.toArray()

					return {
						status: 200,
						groupId: JSON.stringify(findGroup._id),
						body: {
							data: JSON.stringify(returnMsgData),
							groupName: findGroup.name,
						},
					}
				}
			}
		}
	}
	const findGroup = await groups.findOne({ name: HASHID, nature: 'HASHTAGS' })

	if (findGroup) {
		const returnMsgData = await massagesCreate
			.aggregate([
				{ $match: { group_id: findGroup._id } },
				{
					$project: {
						_id: 1,
						message: 1,
						createdAt: 1,
						sender: 1,
					},
				},
			])
			.sort({ createdAt: -1 })
			.limit(10)
			.toArray()

		return {
			status: 200,
			groupId: JSON.stringify(findGroup._id),
			body: {
				data: JSON.stringify(returnMsgData),
				groupName: findGroup.name,
			},
		}
	}
}) as PageServerLoad
