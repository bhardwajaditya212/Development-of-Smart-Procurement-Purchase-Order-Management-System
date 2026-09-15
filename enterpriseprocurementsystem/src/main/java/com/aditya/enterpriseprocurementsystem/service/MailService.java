package com.aditya.enterpriseprocurementsystem.service;

import com.aditya.enterpriseprocurementsystem.entity.Delivery;
import com.aditya.enterpriseprocurementsystem.entity.Payment;
import com.aditya.enterpriseprocurementsystem.entity.Request;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    // =====================================================
    // COMMON HTML MAIL METHOD
    // =====================================================

    public void sendHtmlMail(
            String to,
            String subject,
            String htmlBody)
            throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);

        mailSender.send(message);
    }

    // =====================================================
    // NEW REQUEST → HR / ADMIN
    // =====================================================

    public void sendRequestRaisedMail(
            String hrEmail,
            Request request) {

        String subject = "New Procurement Request - #" + request.getRequestId();

        String productName = (request.getProduct() != null && request.getProduct().getName() != null)
                ? request.getProduct().getName()
                : "N/A";

        String userName = (request.getUser() != null && request.getUser().getName() != null)
                ? request.getUser().getName()
                : "Employee";

        String deptName = (request.getDepartment() != null && request.getDepartment().getDepartmentName() != null)
                ? request.getDepartment().getDepartmentName()
                : "N/A";

        String body = """
                <html>
                <body style="font-family:Arial,sans-serif; background-color:#f4f6f8; padding:30px;">
                    <div style="max-width:650px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
                        <div style="background:#172033; color:white; padding:25px; text-align:center;">
                            <h2>ENTERPRISE PROCUREMENT SYSTEM</h2>
                            <p>New Request Submitted</p>
                        </div>
                        <div style="padding:25px;">
                            <div style="background:#fff4d6; padding:12px; border-radius:6px; margin-bottom:20px;">
                                <b>Status:</b> PENDING FOR APPROVAL
                            </div>
                            <h3>Request Details</h3>
                            <table style="width:100%%; border-collapse:collapse;">
                                <tr>
                                    <td style="padding:10px; border-bottom:1px solid #eee;"><b>Request ID</b></td>
                                    <td style="padding:10px; border-bottom:1px solid #eee;">#%d</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px; border-bottom:1px solid #eee;"><b>Employee</b></td>
                                    <td style="padding:10px; border-bottom:1px solid #eee;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px; border-bottom:1px solid #eee;"><b>Department</b></td>
                                    <td style="padding:10px; border-bottom:1px solid #eee;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px; border-bottom:1px solid #eee;"><b>Product</b></td>
                                    <td style="padding:10px; border-bottom:1px solid #eee;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;"><b>Quantity</b></td>
                                    <td style="padding:10px;">%d</td>
                                </tr>
                            </table>
                            <p style="margin-top:25px;">Please review this procurement request.</p>
                        </div>
                        <div style="background:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#777;">
                            Enterprise Procurement System
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                request.getRequestId(),
                userName,
                deptName,
                productName,
                request.getQuantity()
        );

        try {
            sendHtmlMail(hrEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Mail notification dispatch warning: " + e.getMessage());
        }
    }

    // =====================================================
    // APPROVED → USER
    // =====================================================

    public void sendApprovalMail(
            String userEmail,
            Request request) {

        String subject = "Request Approved - #" + request.getRequestId();

        String productName = (request.getProduct() != null && request.getProduct().getName() != null)
                ? request.getProduct().getName()
                : "Requested Item";

        double unitPrice = 0.0;
        if (request.getProduct() != null) {
            unitPrice = request.getProduct().getPricePerProduct();
        }

        int quantity = request.getQuantity();
        double totalCost = unitPrice * quantity;

        String feedback = (request.getFeedback() != null && !request.getFeedback().isBlank())
                ? request.getFeedback()
                : "Approved by Admin";

        String userName = (request.getUser() != null && request.getUser().getName() != null)
                ? request.getUser().getName()
                : "User";

        String body = """
                <html>
                <body style="font-family:Arial,sans-serif; background:#f4f6f8; padding:30px;">
                    <div style="max-width:650px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
                        <div style="background:#087f5b; color:white; padding:25px; text-align:center;">
                            <h2>ENTERPRISE PROCUREMENT SYSTEM</h2>
                            <h3>Request Approved ✓</h3>
                        </div>
                        <div style="padding:25px;">
                            <div style="background:#e7f8ef; padding:12px; border-radius:6px;">
                                <b>Status:</b> APPROVED
                            </div>
                            <p>Dear %s,</p>
                            <p>Your procurement request has been approved successfully.</p>
                            <h3>Request Details</h3>
                            <table style="width:100%%; border-collapse:collapse;">
                                <tr>
                                    <td style="padding:10px;"><b>Request ID</b></td>
                                    <td style="padding:10px;">#%d</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;"><b>Product</b></td>
                                    <td style="padding:10px;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;"><b>Admin Feedback</b></td>
                                    <td style="padding:10px;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;"><b>Unit Price</b></td>
                                    <td style="padding:10px;">₹%.2f</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;"><b>Approved Quantity</b></td>
                                    <td style="padding:10px;">%d</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px; background:#e7f8ef;"><b>Total Approved Cost</b></td>
                                    <td style="padding:10px; background:#e7f8ef; color:#087f5b; font-weight:bold;">₹%.2f</td>
                                </tr>
                            </table>
                            <p style="margin-top:25px;">Thank you for using the Enterprise Procurement System.</p>
                        </div>
                        <div style="background:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#777;">
                            Enterprise Procurement System
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                userName,
                request.getRequestId(),
                productName,
                feedback,
                unitPrice,
                quantity,
                totalCost
        );

        try {
            sendHtmlMail(userEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Mail notification dispatch warning: " + e.getMessage());
        }
    }

    // =====================================================
    // REJECTED → USER
    // =====================================================

    public void sendRejectionMail(
            String userEmail,
            Request request) {

        String subject = "Request Rejected - #" + request.getRequestId();

        String productName = (request.getProduct() != null && request.getProduct().getName() != null)
                ? request.getProduct().getName()
                : "Requested Item";

        double unitPrice = 0.0;
        if (request.getProduct() != null) {
            unitPrice = request.getProduct().getPricePerProduct();
        }

        int quantity = request.getQuantity();
        double totalCost = unitPrice * quantity;

        String feedback = (request.getFeedback() != null && !request.getFeedback().isBlank())
                ? request.getFeedback()
                : "No feedback provided.";

        String userName = (request.getUser() != null && request.getUser().getName() != null)
                ? request.getUser().getName()
                : "User";

        String body = """
                <html>
                <body style="font-family:Arial,sans-serif; background:#f4f6f8; padding:30px;">
                    <div style="max-width:650px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
                        <div style="background:#c92a2a; color:white; padding:25px; text-align:center;">
                            <h2>ENTERPRISE PROCUREMENT SYSTEM</h2>
                            <h3>Request Rejected ✕</h3>
                        </div>
                        <div style="padding:25px;">
                            <div style="background:#fff0f0; padding:12px; border-radius:6px; color:#c92a2a;">
                                <b>Status:</b> REJECTED
                            </div>
                            <p>Dear %s,</p>
                            <p>Your procurement request has been rejected.</p>
                            <h3>Request Details</h3>
                            <table style="width:100%%; border-collapse:collapse;">
                                <tr>
                                    <td style="padding:10px;"><b>Request ID</b></td>
                                    <td style="padding:10px;">#%d</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;"><b>Product</b></td>
                                    <td style="padding:10px;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;"><b>Admin Feedback</b></td>
                                    <td style="padding:10px;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;"><b>Unit Price</b></td>
                                    <td style="padding:10px;">₹%.2f</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px;"><b>Requested Quantity</b></td>
                                    <td style="padding:10px;">%d</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px; background:#fff0f0;"><b>Estimated Total Cost</b></td>
                                    <td style="padding:10px; background:#fff0f0; color:#c92a2a; font-weight:bold;">₹%.2f</td>
                                </tr>
                            </table>
                            <p style="margin-top:25px;">Please contact your HR/Admin for more information regarding this request.</p>
                        </div>
                        <div style="background:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#777;">
                            Enterprise Procurement System
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                userName,
                request.getRequestId(),
                productName,
                feedback,
                unitPrice,
                quantity,
                totalCost
        );

        try {
            sendHtmlMail(userEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Mail notification dispatch warning: " + e.getMessage());
        }
    }

    // =====================================================
    // DELIVERY STATUS → USER
    // =====================================================

    public void sendDeliveryStatusMail(
            String userEmail,
            Delivery delivery) {

        if (delivery == null || delivery.getRequest() == null) {
            return;
        }

        Request request = delivery.getRequest();
        String status = delivery.getStatus() != null ? delivery.getStatus().toUpperCase() : "PROCESSING";

        String title;
        String message;
        String statusBackground;
        String statusColor;

        switch (status) {
            case "PROCESSING":
                title = "Order Processing";
                message = "Your procurement request is currently being processed.";
                statusBackground = "#fff4d6";
                statusColor = "#b26a00";
                break;
            case "SHIPPED":
            case "IN TRANSIT":
                title = "Order Shipped";
                message = "Your order has been shipped and is on the way.";
                statusBackground = "#e7f0ff";
                statusColor = "#1c5db8";
                break;
            case "OUT FOR DELIVERY":
                title = "Out for Delivery!";
                message = "Your order is out for delivery and will arrive soon.";
                statusBackground = "#fff4d6";
                statusColor = "#b26a00";
                break;
            case "DELIVERED":
                title = "Order Delivered ✓";
                message = "Your order has been successfully delivered.";
                statusBackground = "#e7f8ef";
                statusColor = "#087f5b";
                break;
            default:
                title = "Delivery Status Update";
                message = "Your procurement delivery status has been updated.";
                statusBackground = "#e7f0ff";
                statusColor = "#1c5db8";
        }

        String remarks = (delivery.getRemarks() != null && !delivery.getRemarks().isBlank())
                ? delivery.getRemarks()
                : "No additional remarks.";

        String userName = (request.getUser() != null && request.getUser().getName() != null)
                ? request.getUser().getName()
                : "User";

        String productName = (request.getProduct() != null && request.getProduct().getName() != null)
                ? request.getProduct().getName()
                : "Product";

        int quantity = request.getQuantity();

        String deliveryDate = (delivery.getDeliveryDate() != null)
                ? delivery.getDeliveryDate().toString()
                : "Not available";

        String subject = title + " - Request #" + request.getRequestId();

        String body = """
            <html>
            <body style="margin:0; padding:30px; background-color:#f4f6f8; font-family:Arial,sans-serif;">
                <div style="max-width:650px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <div style="background:#172033; color:white; padding:30px; text-align:center;">
                        <div style="font-size:13px; opacity:0.8; margin-bottom:10px;">ENTERPRISE PROCUREMENT SYSTEM</div>
                        <h2 style="margin:5px 0;">%s</h2>
                        <p style="margin:8px 0 0; font-size:14px; opacity:0.9;">Request #%d</p>
                    </div>
                    <div style="padding:30px;">
                        <div style="background:%s; color:%s; padding:14px; border-radius:6px; margin-bottom:25px; font-size:15px;">
                            <b>Status:</b> %s
                        </div>
                        <p>Hello <b>%s</b>,</p>
                        <p style="color:#555; line-height:1.6;">%s</p>
                        <h3 style="color:#172033; margin-top:28px;">Order Details (#%d)</h3>
                        <table style="width:100%%; border-collapse:collapse;">
                            <tr>
                                <td style="padding:12px 5px; border-bottom:1px solid #eee; color:#555;"><b>Product Name</b></td>
                                <td style="padding:12px 5px; border-bottom:1px solid #eee;">%s</td>
                            </tr>
                            <tr>
                                <td style="padding:12px 5px; border-bottom:1px solid #eee; color:#555;"><b>Quantity</b></td>
                                <td style="padding:12px 5px; border-bottom:1px solid #eee;">%d units</td>
                            </tr>
                            <tr>
                                <td style="padding:12px 5px; border-bottom:1px solid #eee; color:#555;"><b>Remarks</b></td>
                                <td style="padding:12px 5px; border-bottom:1px solid #eee;">%s</td>
                            </tr>
                            <tr>
                                <td style="padding:12px 5px; color:#555;"><b>Updated Date</b></td>
                                <td style="padding:12px 5px;">%s</td>
                            </tr>
                        </table>
                        <p style="margin-top:30px; color:#555; line-height:1.6;">Thank you for using the Enterprise Procurement System.</p>
                    </div>
                    <div style="background:#f4f6f8; text-align:center; padding:18px; font-size:12px; color:#777;">
                        Enterprise Procurement System
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                title,
                request.getRequestId(),
                statusBackground,
                statusColor,
                status,
                userName,
                message,
                request.getRequestId(),
                productName,
                quantity,
                remarks,
                deliveryDate
        );

        try {
            sendHtmlMail(userEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Mail notification dispatch warning: " + e.getMessage());
        }
    }

    // =====================================================
    // DELIVERY STATUS → ADMIN
    // =====================================================

    public void sendDeliveryStatusMailToAdmin(
            String adminEmail,
            Delivery delivery) {

        if (delivery == null || delivery.getRequest() == null) {
            return;
        }

        Request request = delivery.getRequest();
        String status = (delivery.getStatus() != null) ? delivery.getStatus() : "UPDATED";
        String subject = "Delivery Status Update - Request #" + request.getRequestId();

        String remarks = (delivery.getRemarks() != null && !delivery.getRemarks().isBlank())
                ? delivery.getRemarks()
                : "No additional remarks.";

        String productName = (request.getProduct() != null && request.getProduct().getName() != null)
                ? request.getProduct().getName()
                : "Product";

        String body = """
            <html>
            <body style="font-family:Arial,sans-serif; background:#f4f6f8; padding:30px;">
                <div style="max-width:650px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
                    <div style="background:#172033; color:white; padding:25px; text-align:center;">
                        <h2>ENTERPRISE PROCUREMENT SYSTEM</h2>
                        <p>Delivery Status Updated</p>
                    </div>
                    <div style="padding:25px;">
                        <div style="background:#e7f0ff; padding:12px; border-radius:6px; color:#1c5db8;">
                            <b>Status:</b> %s
                        </div>
                        <h3>Delivery Info</h3>
                        <p><b>Request ID:</b> #%d</p>
                        <p><b>Product:</b> %s</p>
                        <p><b>Remarks:</b> %s</p>
                    </div>
                    <div style="background:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#777;">
                        Enterprise Procurement System
                    </div>
                </div>
            </body>
            </html>
            """.formatted(status, request.getRequestId(), productName, remarks);

        try {
            sendHtmlMail(adminEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send admin delivery email: " + e.getMessage());
        }
    }

    // =====================================================
    // PAYMENT SUCCESSFUL → EMPLOYEE
    // =====================================================
    public void sendPaymentSuccessMail(
            String employeeEmail,
            Request request,
            Payment payment) {

        if (employeeEmail == null || employeeEmail.isBlank() || request == null) {
            return;
        }

        String subject = "Payment Successful - Request #" + request.getRequestId();
        String productName = (request.getProduct() != null && request.getProduct().getName() != null)
                ? request.getProduct().getName()
                : "Procured Product";

        double amount = (payment.getAmount() != null) ? payment.getAmount() : 0.0;
        String paymentMethod = (payment.getPaymentMethod() != null) ? payment.getPaymentMethod() : "Digital Gateway";
        String txnId = (payment.getTransactionId() != null) ? payment.getTransactionId() : "N/A";
        String userName = (request.getUser() != null && request.getUser().getName() != null)
                ? request.getUser().getName()
                : "Employee";

        String body = """
            <html>
            <body style="font-family:Arial,sans-serif; background:#f4f6f8; padding:30px;">
                <div style="max-width:650px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
                    <div style="background:#087f5b; color:white; padding:25px; text-align:center;">
                        <h2>ENTERPRISE PROCUREMENT SYSTEM</h2>
                        <h3>Payment Successful ✓</h3>
                    </div>
                    <div style="padding:25px;">
                        <div style="background:#e7f8ef; padding:12px; border-radius:6px; color:#087f5b; margin-bottom:20px;">
                            <b>Status:</b> PAYMENT_SUCCESSFUL (Order Passed to Supplier for Fulfillment)
                        </div>
                        <p>Dear <b>%s</b>,</p>
                        <p>Your procurement request #%d has been successfully paid by Admin.</p>
                        <table style="width:100%%; border-collapse:collapse; margin-top:15px;">
                            <tr>
                                <td style="padding:10px; border-bottom:1px solid #eee;"><b>Product</b></td>
                                <td style="padding:10px; border-bottom:1px solid #eee;">%s</td>
                            </tr>
                            <tr>
                                <td style="padding:10px; border-bottom:1px solid #eee;"><b>Quantity</b></td>
                                <td style="padding:10px; border-bottom:1px solid #eee;">%d</td>
                            </tr>
                            <tr>
                                <td style="padding:10px; border-bottom:1px solid #eee;"><b>Settled Amount</b></td>
                                <td style="padding:10px; border-bottom:1px solid #eee; color:#087f5b; font-weight:bold;">₹%.2f</td>
                            </tr>
                            <tr>
                                <td style="padding:10px; border-bottom:1px solid #eee;"><b>Payment Mode</b></td>
                                <td style="padding:10px; border-bottom:1px solid #eee;">%s</td>
                            </tr>
                            <tr>
                                <td style="padding:10px;"><b>Transaction ID</b></td>
                                <td style="padding:10px; font-family:monospace;">%s</td>
                            </tr>
                        </table>
                    </div>
                    <div style="background:#f4f6f8; text-align:center; padding:15px; font-size:12px; color:#777;">
                        Enterprise Procurement System
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, request.getRequestId(), productName, request.getQuantity(), amount, paymentMethod, txnId);

        try {
            sendHtmlMail(employeeEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send payment email to employee: " + e.getMessage());
        }
    }

    // =====================================================
    // PAYMENT SUCCESSFUL → ADMIN
    // =====================================================
    public void sendPaymentSuccessMailToAdmin(
            String adminEmail,
            Request request,
            Payment payment) {

        if (adminEmail == null || adminEmail.isBlank() || request == null) {
            return;
        }

        String subject = "Payment Confirmation - Request #" + request.getRequestId();
        String productName = (request.getProduct() != null && request.getProduct().getName() != null)
                ? request.getProduct().getName()
                : "Procured Product";

        double amount = (payment.getAmount() != null) ? payment.getAmount() : 0.0;
        String paymentMethod = (payment.getPaymentMethod() != null) ? payment.getPaymentMethod() : "Digital Gateway";
        String txnId = (payment.getTransactionId() != null) ? payment.getTransactionId() : "N/A";

        String body = """
            <html>
            <body style="font-family:Arial,sans-serif; background:#f4f6f8; padding:30px;">
                <div style="max-width:650px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
                    <div style="background:#172033; color:white; padding:25px; text-align:center;">
                        <h2>ENTERPRISE PROCUREMENT SYSTEM</h2>
                        <p>Payment Disbursed Successfully</p>
                    </div>
                    <div style="padding:25px;">
                        <p>Payment of <b>₹%.2f</b> has been authorized via <b>%s</b> for Request #%d (%s).</p>
                        <p><b>Transaction ID:</b> %s</p>
                        <p>Purchase Order is now actionable for Supplier Fulfillment.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(amount, paymentMethod, request.getRequestId(), productName, txnId);

        try {
            sendHtmlMail(adminEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send payment email to admin: " + e.getMessage());
        }
    }

    // =====================================================
    // NEW PAID ORDER → SUPPLIER
    // =====================================================
    public void sendSupplierOrderMail(
            String supplierEmail,
            Request request,
            Payment payment) {

        if (supplierEmail == null || supplierEmail.isBlank() || request == null) {
            return;
        }

        String subject = "New Paid Order Allocated - PO #" + request.getRequestId();
        String productName = (request.getProduct() != null && request.getProduct().getName() != null)
                ? request.getProduct().getName()
                : "Product";

        double amount = (payment.getAmount() != null) ? payment.getAmount() : 0.0;

        String body = """
            <html>
            <body style="font-family:Arial,sans-serif; background:#f4f6f8; padding:30px;">
                <div style="max-width:650px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
                    <div style="background:#087f5b; color:white; padding:25px; text-align:center;">
                        <h2>ENTERPRISE PROCUREMENT SYSTEM</h2>
                        <h3>New Paid Purchase Order Available</h3>
                    </div>
                    <div style="padding:25px;">
                        <p>You have a new paid order ready for fulfillment.</p>
                        <p><b>PO Number:</b> PO-%04d</p>
                        <p><b>Product:</b> %s (Quantity: %d)</p>
                        <p><b>Order Value:</b> ₹%.2f (Status: PAID)</p>
                        <p>Please log in to the Supplier Portal to accept and ship this order.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(request.getRequestId(), productName, request.getQuantity(), amount);

        try {
            sendHtmlMail(supplierEmail, subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send order email to supplier: " + e.getMessage());
        }
    }
}