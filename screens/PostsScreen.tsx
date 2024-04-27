import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { Button, SafeAreaView, StyleSheet, Text } from "react-native";

const API_URL = "http://localhost:3001";

export interface Post {
  id: string;
  title: string;
  views: number;
}
export interface PostAddPayload {
  title: string;
  views: number;
}

const PostsScreen = () => {
  const queryClient = useQueryClient();
  const { data: fetchedPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => axios.get(`${API_URL}/posts`).then((res) => res.data),
    // initialData: [{ id: "1", title: "a title", views: 100 }],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const addPostToLocalList = (post: Post) => {
    queryClient.setQueryData<Post[]>(["posts"], (posts) => {
      return [...(posts ?? []), post];
    });
  };

  const updateLocalList = (id: string, title: string, views: number) => {
    queryClient.setQueryData<Post[]>(["posts"], (posts) => {
      return posts?.map((post) => {
        if (post.id === id) {
          return {
            ...post,
            title,
            views,
          };
        }
        return post;
      });
    });
  };

  const addPostMutation = useMutation({
    mutationKey: ["posts"],
    mutationFn: async (payload: PostAddPayload) =>
      axios.post(`${API_URL}/posts`, payload).then((res) => res.data),
    onSuccess(post) {
      updateLocalList(post.id, post.title, post.views);
    },
    onMutate: async (post: PostAddPayload) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      addPostToLocalList({
        id: Math.random().toString(),
        title: post.title,
        views: post.views,
      });
    },
  });

  return (
    <SafeAreaView>
      <Button
        title="Add"
        onPress={() =>
          addPostMutation.mutate({
            title: "Yeni Makale React" + Math.floor(Math.random() * 1000),
            views: 0,
          })
        }
      ></Button>
      {fetchedPosts
        ? fetchedPosts.map((post: any) => (
            <Text key={post.id} style={{ fontSize: 42 }}>
              {post.title}
            </Text>
          ))
        : null}
    </SafeAreaView>
  );
};

export default PostsScreen;

const styles = StyleSheet.create({});
