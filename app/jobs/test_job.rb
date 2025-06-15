# frozen_string_literal: true

class TestJob < ApplicationJob
  queue_as :default

  def perform(user:)
    sleep 5
    user.posts.create(title: "Post from job", body: "This is a post from a job")
  end
end
