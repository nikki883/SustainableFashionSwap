import axios from "axios";

const handlePayment = async () => {
  try {
    const { data } = await axios.post("/api/payment/create-order", {
      amount: 50, // Replace with actual delivery cost
    });

    const options = {
      key: "your_razorpay_key_id", // Use ENV variable in production
      amount: data.order.amount,
      currency: data.order.currency,
      name: "Fashion Swap",
      description: "Payment for delivery",
      order_id: data.order.id,
      handler: function (response) {
        console.log("Payment Success:", response);
        // You can now confirm order/swap in DB
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
      },
      notes: {
        address: "User Address or Notes",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment Error:", err);
  }
};
