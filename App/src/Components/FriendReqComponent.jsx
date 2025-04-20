import React from "react";
import FriendReqCard from "../Components/FriendReqCard";

export default function FriendReqComponent() {
  return (
    <div className="mx-1 my-4 py-3 bg-white rounded-[32px] pr-3">
      <div className="p-4 space-y-4 xl:h-[calc(64vh)] lg:h-[61vh] max-h-[530px] overflow-y-auto scrollable-div">
        <FriendReqCard
          img="https://placehold.co/60x61"
          name="John Doe"
          email="shehan@gmail.com"
        />
        <FriendReqCard
          img="https://placehold.co/60x61"
          name="John Doe"
          email="shehan@gmail.com"
        />
        <FriendReqCard
          img="https://placehold.co/60x61"
          name="John Doe"
          email="shehan@gmail.com"
        />
        <FriendReqCard
          img="https://placehold.co/60x61"
          name="John Doe"
          email="shehan@gmail.com"
        />
        <FriendReqCard
          img="https://placehold.co/60x61"
          name="John Doe"
          email="shehan@gmail.com"
        />
        <FriendReqCard
          img="https://placehold.co/60x61"
          name="John Doe"
          email="shehan@gmail.com"
        />
        <FriendReqCard
          img="https://placehold.co/60x61"
          name="Johnn Doe"
          email="shehan@gmail.com"
        />
        <FriendReqCard
          img="https://placehold.co/60x61"
          name="Johnnn Doe"
          email="shehan@gmail.com"
        />
      </div>
    </div>
  );
}
