# frozen_string_literal: true

class Settings::BillingController < InertiaController
  before_action :set_stripe_key

  def index
    billing_data = {
      has_subscription: Current.user.has_active_subscription?,
      can_access_features: Current.user.can_access_premium_features?,
      subscription: Current.user.subscription_data
    }

    render inertia: "settings/billing/index", props: { billing: billing_data }
  end

  def create_checkout_session
    begin
      price_id = params[:price_id]
      
      checkout_session = Stripe::Checkout::Session.create({
        customer: Current.user.stripe_customer_id || create_stripe_customer,
        payment_method_types: ['card'],
        line_items: [{
          price: price_id,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: settings_billing_url + '?success=true&session_id={CHECKOUT_SESSION_ID}',
        cancel_url: settings_billing_url + '?error=true',
        metadata: {
          user_id: Current.user.id
        }
      })

      render json: { checkout_url: checkout_session.url }
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: 422
    end
  end

  def checkout_success
    session_id = params[:session_id]
    
    begin
      checkout_session = Stripe::Checkout::Session.retrieve(session_id)
      subscription = Stripe::Subscription.retrieve(checkout_session.subscription)
      
      # Update user's subscription status
      Current.user.update!(
        stripe_subscription_id: subscription.id,
        stripe_customer_id: checkout_session.customer,
        subscription_status: subscription.status,
        subscription_current_period_end: Time.at(subscription.current_period_end)
      )
      
      render json: { message: "Subscription activated successfully!" }
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: 422
    end
  end

  def manage_subscription
    begin
      customer_id = Current.user.stripe_customer_id
      
      if customer_id.blank?
        render json: { error: "No customer found" }, status: 404
        return
      end

      portal_session = Stripe::BillingPortal::Session.create({
        customer: customer_id,
        return_url: settings_billing_url,
      })

      render json: { management_url: portal_session.url }
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: 422
    end
  end

  def cancel_subscription
    begin
      subscription_id = Current.user.stripe_subscription_id
      
      if subscription_id.blank?
        render json: { error: "No subscription found" }, status: 404
        return
      end

      subscription = Stripe::Subscription.retrieve(subscription_id)
      canceled_subscription = Stripe::Subscription.update(subscription_id, {
        cancel_at_period_end: true
      })

      Current.user.update!(subscription_status: 'canceled')
      
      render json: { message: "Subscription will be canceled at the end of the current period." }
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: 422
    end
  end

  def pause_subscription
    begin
      subscription_id = Current.user.stripe_subscription_id
      
      if subscription_id.blank?
        render json: { error: "No subscription found" }, status: 404
        return
      end

      Stripe::Subscription.update(subscription_id, {
        pause_collection: {
          behavior: 'mark_uncollectible'
        }
      })

      Current.user.update!(subscription_status: 'paused')
      
      render json: { message: "Subscription paused successfully." }
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: 422
    end
  end

  def resume_subscription
    begin
      subscription_id = Current.user.stripe_subscription_id
      
      if subscription_id.blank?
        render json: { error: "No subscription found" }, status: 404
        return
      end

      Stripe::Subscription.update(subscription_id, {
        pause_collection: ''
      })

      Current.user.update!(subscription_status: 'active')
      
      render json: { message: "Subscription resumed successfully." }
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: 422
    end
  end

  private

  def set_stripe_key
    Stripe.api_key = Rails.application.credentials.stripe&.secret_key || ENV['STRIPE_SECRET_KEY']
  end

  def create_stripe_customer
    customer = Stripe::Customer.create({
      email: Current.user.email,
      metadata: {
        user_id: Current.user.id
      }
    })
    
    Current.user.update!(stripe_customer_id: customer.id)
    customer.id
  end
end