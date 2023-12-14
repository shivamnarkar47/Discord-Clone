import { currentProfilePages } from "@/lib/current-profile-page";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const profile = await currentProfilePages(req);

    const { content, fileUrl } = req.body;
    const { conversationId } = req.query;

    if (!profile) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation Id  Missing" });
    }

    if (!content) {
      return res.status(400).json({ message: "Content Missing" });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return res.status(404).json({ message: "Members not found" });
    }

    const directMessage = await db.directMessage.create({
      data: {
        content,
        fileUrl,
        conversationId: conversation.id as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${conversationId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, directMessage);

    return res.status(200).json(directMessage);
  } catch (err) {
    console.log("[MESSAGES_POST]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
