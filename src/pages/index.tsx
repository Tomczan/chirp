import { SignIn, SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

import { RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-4">
      <Image
        src={user.profileImageUrl}
        alt={`Your profile picture`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="Type some emojis"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {!isPosting && (
        <button
          onClick={() => mutate({ content: input })}
          disabled={isPosting || input === ""}
          className="disabled:opacity-50"
        >
          Send
        </button>
      )}
      {isPosting && (
        <div className="flex flex-col items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <Link href={`/post/${post.id}`}>
      <div
        key={post.id}
        className="flex gap-3 border-b border-slate-400 p-4 hover:cursor-pointer hover:bg-gray-900"
      >
        <Image
          src={author.profilePicture}
          className="h-14 w-14 rounded-full"
          alt={`Author ${author.username}'s profile picture`}
          width={56}
          height={56}
        />
        <div className="flex flex-col">
          <div className="flex gap-1 text-slate-500">
            <Link href={`/@${author.username}`}>
              <span className="font-bold text-slate-200 hover:underline">
                {author.firstName && author.lastName
                  ? `${author.firstName} ${author.lastName}`
                  : author.username}
              </span>
            </Link>

            <span className="font-thin">
              {`@${author.username}`}{" "}
              <span>{` · ${dayjs(post.createdAt).fromNow()}`}</span>
            </span>
          </div>
          <span className="text-2xl">{post.content}</span>
        </div>
      </div>
    </Link>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching early
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div></div>;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4 text-white">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </PageLayout>
  );
};

export default Home;
