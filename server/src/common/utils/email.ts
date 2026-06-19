import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const sendOverdueEmail = async ({
  email,
  title,
  loanType,
  dueDate,
}: {
  email: string;
  title: string;
  loanType: string;
  dueDate: Date;
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thông báo tài liệu quá hạn",
    html: `
      <h1>Thư viện Trường Đại Học Sư Phạm Hà Nội (HNUE) </h1>
      <h2>Thông báo tài liệu mượn quá hạn! </h2>
      <p>Tài liệu của bạn đã quá hạn:</p>

      <ul>
        <li><strong>Tên tài liệu:</strong> ${title}</li>
        <li><strong>Loại:</strong> ${
          loanType === "ebook" ? "Ebook" : "Sách vật lý"
        }</li>
        <li><strong>Hạn trả:</strong> ${new Date(dueDate).toLocaleDateString(
          "vi-VN",
        )}</li>
      </ul>

      <p>
        Vui lòng xử lý sớm để tránh phát sinh thêm phí phạt.
      </p>
    `,
  });
};
