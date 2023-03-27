import type { PageServerLoad } from './$types'
import { mainUser, groups, massagesCreate } from '$db/collections'
import { ObjectId } from 'mongodb'

export const load = (async ({ params }) => {
	const { user, groupId } = params

	const findGroupbyId = await groups.findOne({ _id: new ObjectId(groupId) })
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
			// sort by likes greater than 100
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
				nature: findGroupbyId.nature,
			},
		}
	} else {
		return
	}
}) satisfies PageServerLoad