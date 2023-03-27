import { json } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

import { mainUser, groups, massagesCreate } from '$db/collections'
import { ObjectId } from 'mongodb'

export const load = (async ({ params }) => {
	const { user, SLUG } = params
	const latestMessages: any = []

	if (user) {
		const findUser = await mainUser.findOne({ _id: new ObjectId(user) })
		if (findUser) {
			const findGroup = await groups.findOne({ _id: new ObjectId(SLUG) })
			if (findGroup) {
				const findUserLink = await mainUser.findOne({ _id: findUser._id, allGroups: { $in: [findGroup._id] } })

				if (!findUserLink) {
					await mainUser.updateOne({ _id: findUser._id }, { $addToSet: { allGroups: findGroup._id } })
				}

				const returnMsgData = await massagesCreate
					.aggregate([
						{ $match: { group_id: new ObjectId(SLUG), isReply: false } },
						{
							$project: {
								_id: 1,
								message: 1,
								createdAt: 1,
								sender: 1,
								likedPeople: 1,
								likes: 1,

								replies: 1,
								isReply: 1,
								totalReplies: 1,
							},
						},
					])
					.sort({ createdAt: -1 })
					.limit(100)
					.toArray()

				const topLikes = await massagesCreate
					.aggregate([
						{ $match: { group_id: findGroup._id, isReply: false } },
						{
							$project: {
								_id: 1,
								message: 1,
								createdAt: 1,
								sender: 1,
								likedPeople: 1,
								likes: 1,

								replies: 1,
								isReply: 1,
								totalReplies: 1,
							},
						},
					])
					.match({ likes: { $gt: 19 } })
					.sort({ likes: 1 })
					.limit(10)
					.toArray()

				return {
					status: 200,
					groupId: JSON.stringify(findGroup._id),
					body: {
						messages: JSON.stringify(returnMsgData),
						topLikes: JSON.stringify(topLikes),
						groupName: findGroup.name,
						createdAt: findGroup.createdAt,
					},
				}
			}
		}
	} else {
		const findGroup = await groups.findOne({ name: SLUG, nature: 'LOCATIONS' })
		if (findGroup) {
			const returnMsgData = await massagesCreate
				.aggregate([
					{ $match: { group_id: findGroup._id, isReply: false } },
					{
						$project: {
							_id: 1,
							message: 1,
							createdAt: 1,
							sender: 1,
							likedPeople: 1,
							likes: 1,

							replies: 1,
							isReply: 1,
							totalReplies: 1,
						},
					},
				])
				.sort({ createdAt: -1 })
				.limit(100)
				.toArray()

			const topLikes = await massagesCreate
				.aggregate([
					{ $match: { group_id: findGroup._id, isReply: false } },
					{
						$project: {
							_id: 1,
							message: 1,
							createdAt: 1,
							sender: 1,
							likedPeople: 1,
							likes: 1,

							replies: 1,
							isReply: 1,
							totalReplies: 1,
						},
					},
				])
				.match({ likes: { $gt: 19 } })
				.sort({ likes: 1 })
				.limit(10)
				.toArray()

			return {
				status: 200,
				groupId: JSON.stringify(findGroup._id),
				body: {
					messages: JSON.stringify(returnMsgData),
					topLikes: JSON.stringify(topLikes),
					groupName: findGroup.name,
					createdAt: findGroup.createdAt,
				},
			}
		}
		const findGroupbyId = await groups.findOne({ _id: new ObjectId(SLUG) })
		if (findGroupbyId) {
			const returnMsgData = await massagesCreate
				.aggregate([
					{ $match: { group_id: findGroupbyId._id, isReply: false } },
					{
						$project: {
							_id: 1,
							message: 1,
							createdAt: 1,
							sender: 1,
							likedPeople: 1,
							likes: 1,

							replies: 1,
							isReply: 1,
							totalReplies: 1,
						},
					},
				])
				.sort({ createdAt: -1 })
				.limit(100)
				.toArray()

			const topLikes = await massagesCreate
				.aggregate([
					{ $match: { group_id: findGroupbyId._id, isReply: false } },
					{
						$project: {
							_id: 1,
							message: 1,
							createdAt: 1,
							sender: 1,
							likedPeople: 1,
							likes: 1,

							replies: 1,
							isReply: 1,
							totalReplies: 1,
						},
					},
				])
				.match({ likes: { $gt: 19 } })
				.sort({ likes: 1 })
				.limit(10)
				.toArray()

			return {
				status: 200,
				groupId: JSON.stringify(findGroupbyId._id),
				body: {
					messages: JSON.stringify(returnMsgData),
					topLikes: JSON.stringify(topLikes),
					groupName: findGroupbyId.name,
					createdAt: findGroupbyId.createdAt,
				},
			}
		}
	}
}) as PageServerLoad
