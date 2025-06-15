# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  generates_token_for :email_verification, expires_in: 2.days do
    email
  end

  generates_token_for :password_reset, expires_in: 20.minutes do
    password_salt.last(10)
  end


  has_many :sessions, dependent: :destroy
  has_many :posts, dependent: :destroy

  validates :email, presence: true, uniqueness: true, format: {with: URI::MailTo::EMAIL_REGEXP}
  validates :password, allow_nil: true, length: {minimum: 2}

  normalizes :email, with: -> { _1.strip.downcase }

  before_validation if: :email_changed?, on: :update do
    self.verified = false
  end

  after_update if: :password_digest_previously_changed? do
    sessions.where.not(id: Current.session).delete_all
  end

  def has_active_subscription?
    return false if stripe_subscription_id.blank?
    return false if subscription_status.blank?
    
    %w[active trialing].include?(subscription_status) && 
      (subscription_current_period_end.nil? || subscription_current_period_end > Time.current)
  end

  def can_access_premium_features?
    has_active_subscription?
  end

  def subscription_data
    return nil unless stripe_subscription_id.present?
    
    {
      status: subscription_status || 'unknown',
      plan_name: 'Pro Plan',
      monthly_price: { formatted: '$29' },
      subscription_starts_at: created_at.iso8601,
      current_period_end: subscription_current_period_end&.iso8601,
      next_billing_date: subscription_current_period_end&.iso8601,
      trial_active: subscription_status == 'trialing',
      trial_ends_at: subscription_status == 'trialing' ? subscription_current_period_end&.iso8601 : nil,
      days_until_trial_ends: subscription_status == 'trialing' && subscription_current_period_end ? 
        ((subscription_current_period_end - Time.current) / 1.day).ceil : nil,
      canceled_at: subscription_status == 'canceled' ? updated_at.iso8601 : nil
    }
  end
end
