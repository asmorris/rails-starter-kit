import { Head, useForm } from "@inertiajs/react"
import { useState, useCallback, FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form"
import { useActionCable } from "@/hooks/use-actioncable"
import AppLayout from "@/layouts/app-layout"
import { postsPath } from "@/routes"
import type { BreadcrumbItem } from "@/types"
import { toast } from "sonner"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Posts",
    href: postsPath(),
  },
]

interface Post {
  id: number
  title: string
  body: string
  user: {
    id: number
    email: string
  }
  created_at: string
}

interface PostsProps {
  posts: Post[]
}

export default function Posts({ posts: initialPosts }: PostsProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts || [])

  const form = useForm({
    post: {
      title: "",
      body: "",
    },
  })

  const handleNewPost = useCallback((data: any) => {
    if (data.type === "new_post") {
      setPosts((prevPosts) => [data.post, ...prevPosts])
      // toast.success("Post created!")
    }
  }, [])

  useActionCable("PostsChannel", handleNewPost)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    form.post(postsPath(), {
      onSuccess: () => {
        form.reset()
      },
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Posts" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {/* Create Post Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <Form form={form} onSubmit={handleSubmit} className="space-y-4">
              <FormField
                name="post.title"
                render={({ field, error }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter post title..." />
                    </FormControl>
                    <FormMessage>{error}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                name="post.body"
                render={({ field, error }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter post content..."
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage>{error}</FormMessage>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.processing}>
                {form.processing ? "Creating..." : "Create Post"}
              </Button>
            </Form>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  No posts yet. Create the first one!
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    By {post.user.email} •{" "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.body}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
