# frozen_string_literal: true

class Post < ApplicationRecord
  belongs_to :user

  after_create_commit { broadcast_new_post }

  private

  def broadcast_new_post
    ActionCable.server.broadcast "posts", {
      type: "new_post",
      post: {
        id: id,
        title: title,
        body: body,
        user: {
          id: user.id,
          email: user.email
        },
        created_at: created_at
      }
    }
  end
end
