from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os
import re
from dotenv import load_dotenv
from config import Config

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
os.makedirs('instance', exist_ok=True)
app.config.from_object(Config)

# Initialize extensions
db = SQLAlchemy(app)
mail = Mail(app)
login_manager = LoginManager(app)
login_manager.login_view = 'admin_login'

# ========================================
# DATABASE MODELS
# ========================================

class Contact(db.Model):
    __tablename__ = 'contact'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    service = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='New')  # New, Read, Responded
    
    def __repr__(self):
        return f'<Contact {self.name}>'

class Admin(UserMixin, db.Model):
    __tablename__ = 'admin'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<Admin {self.username}>'

class Review(db.Model):
    __tablename__ = 'review'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    service = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Pending')  # Pending, Approved, Rejected
    is_featured = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<Review {self.name} - {self.rating} stars>'

# ========================================
# DATABASE INITIALIZATION
# ========================================

def init_db():
    """Initialize database and create admin user"""
    try:
        # Create all tables
        db.create_all()
        print("=" * 50)
        print("✓ Database tables created successfully")
        
        # Check if admin exists
        admin = Admin.query.filter_by(username=app.config['ADMIN_USERNAME']).first()
        
        if not admin:
            # Create admin user
            admin = Admin(username=app.config['ADMIN_USERNAME'])
            admin.set_password(app.config['ADMIN_PASSWORD'])
            db.session.add(admin)
            db.session.commit()
            print(f"✓ Admin user created")
            print(f"  Username: {app.config['ADMIN_USERNAME']}")
            print(f"  Password: {app.config['ADMIN_PASSWORD']}")
        else:
            print(f"✓ Admin user already exists: {app.config['ADMIN_USERNAME']}")
        
        # Show database info
        contact_count = Contact.query.count()
        review_count = Review.query.count()
        print(f"✓ Total contacts in database: {contact_count}")
        print(f"✓ Total reviews in database: {review_count}")
        print("=" * 50)
        
    except Exception as e:
        print(f"⚠ Database initialization error: {str(e)}")
        import traceback
        traceback.print_exc()

# ========================================
# LOGIN MANAGER
# ========================================

@login_manager.user_loader
def load_user(user_id):
    return Admin.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    flash('Please log in to access this page.', 'warning')
    return redirect(url_for('admin_login'))

# ========================================
# EMAIL FUNCTIONS
# ========================================

def send_client_email(contact_data):
    """Send confirmation email to client"""
    try:
        msg = Message(
            subject='Thank You for Contacting Faith Legal Nepal',
            recipients=[contact_data['email']],
            sender=app.config['MAIL_DEFAULT_SENDER']
        )
        
        # Render HTML email template
        msg.html = render_template('email_template.html', contact=contact_data)
        
        mail.send(msg)
        print(f"✓ Client email sent to: {contact_data['email']}")
        return True
    except Exception as e:
        print(f"✗ Error sending client email: {str(e)}")
        return False

def send_admin_notification(contact_data):
    """Send notification to admin"""
    try:
        msg = Message(
            subject=f'New Contact Form Submission - {contact_data["name"]}',
            recipients=[app.config['MAIL_USERNAME']],
            sender=app.config['MAIL_DEFAULT_SENDER']
        )
        
        msg.body = f"""
New Contact Form Submission

Name: {contact_data['name']}
Email: {contact_data['email']}
Phone: {contact_data['phone']}
Service: {contact_data['service']}

Message:
{contact_data['message']}

---
Submitted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
View in admin panel: http://127.0.0.1:5000/admin/dashboard
        """
        
        mail.send(msg)
        print(f"✓ Admin notification sent")
        return True
    except Exception as e:
        print(f"✗ Error sending admin notification: {str(e)}")
        return False

# ========================================
# ROUTES - MAIN WEBSITE
# ========================================

@app.route('/')
def index():
    """Main website homepage"""
    return render_template('index.html')

@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    """Handle contact form submission"""
    try:
        # Get form data
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        service = request.form.get('service', '').strip()
        message = request.form.get('message', '').strip()
        
        # Log received data
        print(f"\n📩 New contact form submission:")
        print(f"   Name: {name}")
        print(f"   Email: {email}")
        print(f"   Phone: {phone}")
        print(f"   Service: {service}")
        
        # Validate required fields
        missing_fields = []
        if not name:
            missing_fields.append('Name')
        if not email:
            missing_fields.append('Email')
        if not phone:
            missing_fields.append('Phone')
        if not service:
            missing_fields.append('Service')
        if not message:
            missing_fields.append('Message')
        
        if missing_fields:
            return jsonify({
                'success': False,
                'message': f'Please fill in the following fields: {", ".join(missing_fields)}'
            }), 400
        
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return jsonify({
                'success': False,
                'message': 'Please enter a valid email address'
            }), 400
        
        # Create contact record
        contact = Contact(
            name=name,
            email=email,
            phone=phone,
            service=service,
            message=message
        )
        
        # Save to database
        db.session.add(contact)
        db.session.commit()
        
        print(f"✓ Contact saved to database (ID: {contact.id})")
        
        # Prepare contact data for emails
        contact_data = {
            'name': name,
            'email': email,
            'phone': phone,
            'service': service,
            'message': message
        }
        
        # Send emails (non-blocking)
        try:
            # send_client_email(contact_data)
            # send_admin_notification(contact_data)
            print("Email sending temporarily disabled")
        except Exception as email_error:
            print(f"⚠ Email error (non-critical): {str(email_error)}")
        
        return jsonify({
            'success': True,
            'message': f'Thank you, {name}! We have received your inquiry about {service}. We will contact you soon at {email} or {phone}.'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"✗ Error in submit_contact: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'An error occurred while processing your request. Please try again later.'
        }), 500

# ========================================
# ROUTES - REVIEWS
# ========================================

@app.route('/submit-review', methods=['POST'])
def submit_review():
    """Handle review submission"""
    try:
        # Get form data
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        rating = request.form.get('rating', '').strip()
        service = request.form.get('service', '').strip()
        message = request.form.get('message', '').strip()
        
        # Log received data
        print(f"\n⭐ New review submission:")
        print(f"   Name: {name}")
        print(f"   Email: {email}")
        print(f"   Rating: {rating}")
        print(f"   Service: {service}")
        print(f"   Message: {message[:50]}...")
        
        # Validate all fields
        if not all([name, email, rating, service, message]):
            missing = []
            if not name: missing.append('Name')
            if not email: missing.append('Email')
            if not rating: missing.append('Rating')
            if not service: missing.append('Service')
            if not message: missing.append('Message')
            
            return jsonify({
                'success': False,
                'message': f'Missing fields: {", ".join(missing)}'
            }), 400
        
        # Validate rating
        try:
            rating_int = int(rating)
            if rating_int < 1 or rating_int > 5:
                return jsonify({
                    'success': False,
                    'message': 'Rating must be between 1 and 5 stars'
                }), 400
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid rating value'
            }), 400
        
        # Validate email
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return jsonify({
                'success': False,
                'message': 'Please enter a valid email address'
            }), 400
        
        # Create review
        review = Review(
            name=name,
            email=email,
            rating=rating_int,
            service=service,
            message=message,
            status='Pending'
        )
        
        db.session.add(review)
        db.session.commit()
        
        print(f"✓ Review saved to database (ID: {review.id}) - Status: Pending")
        
        # Send admin notification (non-blocking)
        try:
            msg = Message(
                subject=f'New Review Submission - {name} ({rating_int} ⭐)',
                recipients=[app.config['MAIL_USERNAME']],
                sender=app.config['MAIL_DEFAULT_SENDER']
            )
            msg.body = f"""
New Review Submitted (Pending Approval)

Name: {name}
Email: {email}
Rating: {rating_int} stars
Service: {service}

Review:
{message}

---
Submitted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Review in admin panel: http://127.0.0.1:5000/admin/reviews
            """
            # mail.send(msg)
            print("Review email temporarily disabled")
            print("✓ Admin notification sent")
        except Exception as e:
            print(f"⚠ Email error (non-critical): {str(e)}")
        
        return jsonify({
            'success': True,
            'message': f'Thank you for your {rating_int}-star review, {name}! It will be published after admin approval.'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"✗ Error in submit_review: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'An error occurred while submitting your review. Please try again.'
        }), 500

@app.route('/get-reviews')
def get_reviews():
    """Get approved reviews for display"""
    try:
        reviews = Review.query.filter_by(status='Approved').order_by(Review.created_at.desc()).all()
        
        reviews_data = []
        for review in reviews:
            reviews_data.append({
                'id': review.id,
                'name': review.name,
                'rating': review.rating,
                'service': review.service,
                'message': review.message,
                'created_at': review.created_at.strftime('%B %d, %Y'),
                'is_featured': review.is_featured
            })
        
        return jsonify({
            'success': True,
            'reviews': reviews_data
        })
    except Exception as e:
        print(f"Error getting reviews: {str(e)}")
        return jsonify({
            'success': False,
            'reviews': []
        })

# ========================================
# ROUTES - ADMIN PANEL
# ========================================

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if current_user.is_authenticated:
        return redirect(url_for('admin_dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        print(f"\n🔐 Login attempt: {username}")
        
        admin = Admin.query.filter_by(username=username).first()
        
        if admin and admin.check_password(password):
            login_user(admin)
            flash('Login successful!', 'success')
            print(f"✓ Login successful for: {username}")
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid username or password', 'error')
            print(f"✗ Login failed for: {username}")
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
@login_required
def admin_logout():
    """Admin logout"""
    print(f"👋 User logged out: {current_user.username}")
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    """Admin dashboard - view all contacts"""
    # Get all contacts ordered by date (newest first)
    contacts = Contact.query.order_by(Contact.created_at.desc()).all()
    
    # Statistics
    total_contacts = Contact.query.count()
    new_contacts = Contact.query.filter_by(status='New').count()
    read_contacts = Contact.query.filter_by(status='Read').count()
    responded_contacts = Contact.query.filter_by(status='Responded').count()
    
    print(f"\n📊 Dashboard accessed by: {current_user.username}")
    print(f"   Total: {total_contacts}, New: {new_contacts}, Read: {read_contacts}, Responded: {responded_contacts}")
    
    return render_template('admin_dashboard.html', 
                         contacts=contacts,
                         total_contacts=total_contacts,
                         new_contacts=new_contacts,
                         read_contacts=read_contacts,
                         responded_contacts=responded_contacts)

@app.route('/admin/contact/<int:contact_id>/status', methods=['POST'])
@login_required
def update_contact_status(contact_id):
    """Update contact status"""
    contact = Contact.query.get_or_404(contact_id)
    status = request.form.get('status')
    
    if status in ['New', 'Read', 'Responded']:
        old_status = contact.status
        contact.status = status
        db.session.commit()
        flash('Status updated successfully!', 'success')
        print(f"✓ Contact #{contact_id} status: {old_status} → {status}")
    else:
        flash('Invalid status', 'error')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/contact/<int:contact_id>/delete', methods=['POST'])
@login_required
def delete_contact(contact_id):
    """Delete a contact"""
    contact = Contact.query.get_or_404(contact_id)
    contact_name = contact.name
    
    db.session.delete(contact)
    db.session.commit()
    
    flash('Contact deleted successfully!', 'success')
    print(f"🗑 Contact deleted: #{contact_id} - {contact_name}")
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/reviews')
@login_required
def admin_reviews():
    """Admin page to manage reviews"""
    reviews = Review.query.order_by(Review.created_at.desc()).all()
    
    total_reviews = Review.query.count()
    pending_reviews = Review.query.filter_by(status='Pending').count()
    approved_reviews = Review.query.filter_by(status='Approved').count()
    
    print(f"\n⭐ Reviews page accessed by: {current_user.username}")
    print(f"   Total: {total_reviews}, Pending: {pending_reviews}, Approved: {approved_reviews}")
    
    return render_template('admin_reviews.html',
                         reviews=reviews,
                         total_reviews=total_reviews,
                         pending_reviews=pending_reviews,
                         approved_reviews=approved_reviews)

@app.route('/admin/review/<int:review_id>/approve', methods=['POST'])
@login_required
def approve_review(review_id):
    """Approve a review"""
    review = Review.query.get_or_404(review_id)
    review.status = 'Approved'
    db.session.commit()
    
    flash('Review approved successfully!', 'success')
    print(f"✓ Review #{review_id} approved by {current_user.username}")
    
    return redirect(url_for('admin_reviews'))

@app.route('/admin/review/<int:review_id>/reject', methods=['POST'])
@login_required
def reject_review(review_id):
    """Reject a review"""
    review = Review.query.get_or_404(review_id)
    review.status = 'Rejected'
    db.session.commit()
    
    flash('Review rejected.', 'info')
    print(f"✗ Review #{review_id} rejected by {current_user.username}")
    
    return redirect(url_for('admin_reviews'))

@app.route('/admin/review/<int:review_id>/feature', methods=['POST'])
@login_required
def feature_review(review_id):
    """Toggle featured status"""
    review = Review.query.get_or_404(review_id)
    review.is_featured = not review.is_featured
    db.session.commit()
    
    status = "featured" if review.is_featured else "unfeatured"
    flash(f'Review {status} successfully!', 'success')
    print(f"⭐ Review #{review_id} {status} by {current_user.username}")
    
    return redirect(url_for('admin_reviews'))

@app.route('/admin/review/<int:review_id>/delete', methods=['POST'])
@login_required
def delete_review(review_id):
    """Delete a review"""
    review = Review.query.get_or_404(review_id)
    review_name = review.name
    
    db.session.delete(review)
    db.session.commit()
    
    flash('Review deleted successfully!', 'success')
    print(f"🗑 Review deleted: #{review_id} - {review_name}")
    
    return redirect(url_for('admin_reviews'))

# ========================================
# ERROR HANDLERS
# ========================================

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    if request.path.startswith('/admin'):
        flash('Page not found', 'error')
        return redirect(url_for('admin_dashboard'))
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    db.session.rollback()
    print(f"✗ Internal error: {str(error)}")
    if request.path.startswith('/admin'):
        flash('An internal error occurred', 'error')
        return redirect(url_for('admin_dashboard'))
    return jsonify({'success': False, 'message': 'Internal server error'}), 500

# ========================================
# UTILITY ROUTES
# ========================================

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'timestamp': datetime.now().isoformat()
    })

# ========================================
# CLI COMMANDS (Optional)
# ========================================

@app.cli.command()
def initdb():
    """Initialize the database (CLI command)"""
    with app.app_context():
        init_db()

@app.cli.command()
def reset_admin():
    """Reset admin password (CLI command)"""
    with app.app_context():
        admin = Admin.query.filter_by(username=app.config['ADMIN_USERNAME']).first()
        if admin:
            admin.set_password(app.config['ADMIN_PASSWORD'])
            db.session.commit()
            print(f"✓ Admin password reset for: {app.config['ADMIN_USERNAME']}")
        else:
            print("✗ Admin user not found")


# ========================================
# RUN APPLICATION
# ========================================

# if __name__ == '__main__':
    # Initialize database on startup
with app.app_context():
    init_db()
    
    # Run the app
    print("\n🚀 Starting Faith Legal Nepal Application...")
    print(f"📍 Admin Panel: http://127.0.0.1:5000/admin/login")
    print(f"🌐 Website: http://127.0.0.1:5000")
    print(f"⭐ Reviews Admin: http://127.0.0.1:5000/admin/reviews")
    print(f"📊 Dashboard: http://127.0.0.1:5000/admin/dashboard")
    print("\n")
    
    app.run()