# frozen_string_literal: true

class PostsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "posts"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end