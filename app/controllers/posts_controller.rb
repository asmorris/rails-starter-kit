# frozen_string_literal: true

class PostsController < InertiaController
  def index
    @posts = Post.includes(:user).order(created_at: :desc)
    render inertia: "posts/index", props: {
      posts: @posts.map do |post|
        {
          id: post.id,
          title: post.title,
          body: post.body,
          user: {
            id: post.user.id,
            email: post.user.email
          },
          created_at: post.created_at
        }
      end
    }
  end

  def create
    @post = Post.new(post_params)
    @post.user = Current.user
    if @post.save
      flash[:success] = "Post created!"
      TestJob.perform_later(user: Current.user)
      redirect_to posts_path
    else
      render :index
    end
  end

  private

  def post_params
    params.require(:post).permit(:title, :body)
  end
end
