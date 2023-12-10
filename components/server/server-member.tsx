"use client";

import { cn } from "@/lib/utils";
import { Member, MemberRole, Profile, Server } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from "next/navigation";
import UserAvatar from "@/components/user-avatar";
import ActionTooltip from "../action-tooltip";

interface ServerMemberProps {
  member: Member & { profile: Profile };
  server: Server;
}
const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MEMBER]: (
    <Badge className="  text-white  h-6  bg-indigo-500">M</Badge>
  ),
  [MemberRole.ADMIN]: (
    <Badge className="text-white  h-6   bg-rose-500">A</Badge>
  ),
};

const ServerMember = ({ member, server }: ServerMemberProps) => {
  const params = useParams();
  const router = useRouter();

  const Icon = roleIconMap[member.role];

  const onClick = () => {
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  return (
    <div>
      <button
        className={cn(
          "group px-2 py-2 flex rounded-md items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
          params?.memberId === member.id && "bg-zinc-700/20 dark:bg-zinc-700"
        )}
        onClick={onClick}
      >
        <UserAvatar
          src={member.profile.imageUrl}
          className="h-8 w-8 md:h-8 md:w-8"
        />
        <p
          className={cn(
            "font-semibold text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
            params?.memberId === member.id &&
              "text-primary dark:text-zinc-200 dark:group-hover:text-white"
          )}
        >
          {member.profile.name}
        </p>
        <ActionTooltip label={member.role}>
          <div>{Icon}</div>
        </ActionTooltip>
      </button>
    </div>
  );
};

export default ServerMember;
