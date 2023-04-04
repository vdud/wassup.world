import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

import { mainUser, massagesCreate, groups } from '$db/collections';
import { ObjectId } from 'mongodb';

import Pusher from 'pusher';
const pusher = new Pusher({
	appId: import.meta.env.VITE_APP_ID,
	key: import.meta.env.VITE_APP_KEY,
	secret: import.meta.env.VITE_APP_SECRET,
	cluster: import.meta.env.VITE_APP_CLUSTER,
	useTLS: true,
});

export const POST = (async ({ request }) => {
	const { message, $userGroup_id, $userName, $userName_id } = await request.json();
	const newTime = new Date();

	pusher.trigger($userGroup_id, 'injectNav', {
		message: message,
		sender: $userName,
		createdAt: newTime,
		groupId: $userGroup_id,
	});

	pusher.trigger($userGroup_id, 'injectEmptyMessage', {
		message: message,
		sender: $userName,
		createdAt: newTime,
		groupId: $userGroup_id,
	});

	const findUser = await mainUser.findOne({ _id: new ObjectId($userName_id) });
	const findGroup = await groups.findOne({ _id: new ObjectId($userGroup_id) });

	if (!findUser || !findGroup) {
		return json({ success: false });
	}

	const newMessage = await massagesCreate.insertOne({
		sender: $userName,
		message: message,
		group_id: findGroup._id,
		createdAt: newTime,
		likedPeople: [],
		likes: 0,

		isReply: false,
		replies: [],
		totalReplies: 0,
		replyTo: null,
	});
	const findThatmsg = await massagesCreate.findOne({ _id: newMessage.insertedId });

	if (findGroup.nature === 'PUBLIC') {
		const findUserInGroup = await groups.findOne({ _id: findGroup._id, allUsers: findUser._id });
		if (!findUserInGroup) {
			await groups.updateOne({ _id: findGroup._id }, { $set: { name: `${$userName};${findGroup.name}`, lastMessage: message.slice(0, 69), latestMessageSender: $userName, updatedAt: newTime }, $addToSet: { allUsers: findUser._id, messages: findThatmsg._id } }, { upsert: true });
			await mainUser.updateOne({ _id: findUser._id }, { $addToSet: { allGroups: findGroup._id } });
		} else {
			await groups.updateOne({ _id: findGroup._id }, { $set: { lastMessage: message.slice(0, 69), latestMessageSender: $userName, updatedAt: newTime }, $addToSet: { allUsers: findUser._id, messages: findThatmsg._id } }, { upsert: true });
			await mainUser.updateOne({ _id: findUser._id }, { $addToSet: { allGroups: findGroup._id } });
		}
		const findGroupAgain = await groups.findOne({ _id: findGroup._id });
		if (findGroupAgain) {
			const allUsers = findGroupAgain.allUsers.filter((user: any) => String(user) !== String(findUser._id));
			allUsers.forEach((user: any) => {
				pusher.trigger(user.toString(), 'newPubMessage', {
					sender: $userName,
					message: message,
					createdAt: newTime,
					groupId: $userGroup_id,
					groupName: findGroupAgain.name,
				});
			});
		}
	} else if (findGroup.nature === 'LOCATIONS' || findGroup.nature === 'HASHTAGS') {
		await groups.updateOne({ _id: findGroup._id }, { $set: { lastMessage: message.slice(0, 69), latestMessageSender: $userName, updatedAt: newTime }, $addToSet: { allUsers: findUser._id, messages: findThatmsg._id } }, { upsert: true });
		await mainUser.updateOne({ _id: findUser._id }, { $addToSet: { allGroups: findGroup._id } });
	}

	pusher.trigger($userGroup_id, 'injectMessage', {
		message: message,
		sender: $userName,
		createdAt: newTime,
		groupId: $userGroup_id,
		messageId: findThatmsg._id,
	});

	return json({ success: true, messageId: findThatmsg._id });
}) satisfies RequestHandler;
