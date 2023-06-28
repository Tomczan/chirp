import { SignIn, SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";

const SinglePostPage: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching early
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div></div>;

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex justify-center">
        <div>Single post page</div>
      </main>
    </>
  );
};

export default SinglePostPage;
