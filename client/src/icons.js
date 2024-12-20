import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import CloseIcon from '@mui/icons-material/Close';

// Post Modal
import {
  FaPaperPlane,
  FaPaperclip,
  FaRegCalendarAlt,
  FaPollH,
  FaTimes,
} from "react-icons/fa";

// Post Item
import {
  MdFavoriteBorder,
  MdFavorite,
  MdChatBubbleOutline,
  MdShare,
  MdMoreVert,
} from "react-icons/md";

// Report
import { FaRegImages } from "react-icons/fa";

// Header
import { RiMailSendLine } from "react-icons/ri";

// Footer
import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MessageIcon from "@mui/icons-material/Message";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";

// Profile
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import SettingsIcon from "@mui/icons-material/Settings";

// Update Profile
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

// Social Media Icons
import { FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

// X platformu orijinal logosu
const X = ({ className, onClick }) => (
  <svg 
    className={className} 
    onClick={onClick}
    viewBox="0 0 24 24" 
    aria-hidden="true"
    fill="currentColor"
  >
    <path d="M13.3174 10.7749L19.1457 4H17.7646L12.7039 9.88256L8.66193 4H4L10.1122 12.8955L4 20H5.38119L10.7254 13.7878L14.994 20H19.656L13.3171 10.7749H13.3174ZM11.4257 12.9738L10.8064 12.0881L5.87886 5.03974H8.00029L11.9769 10.728L12.5962 11.6137L17.7652 19.0075H15.6438L11.4257 12.9742V12.9738Z" />
  </svg>
);

const Icons = {

  // Report
  FaRegImages,

  // Header
  ReportSend: RiMailSendLine,

  // Footer
  Home: HomeIcon,
  HomeOutlined: HomeOutlinedIcon,
  Search: SearchRoundedIcon,
  Add: AddCircleOutlineIcon,
  Notification: NotificationsNoneIcon,
  NotificationActive: NotificationsActiveIcon,
  MessageIcon,
  MessageOutlinedIcon,

  // Profile
  LogoutOutlinedIcon,
  VpnKeyIcon,
  SettingsIcon,
  MessageIcon,

  // Update Profile
  AddPhotoAlternateIcon,

  // Social Media
  Instagram: FaInstagram,
  WhatsApp: FaWhatsapp,
  X: FaXTwitter,

  // Other
  Back: ArrowBackIcon,
  More: MdMoreVert,
  Heart: MdFavorite,
  HeartBorder: MdFavoriteBorder,
  Comment: MdChatBubbleOutline,
  Share: MdShare,
  Paperclip: FaPaperclip,
  Calendar: FaRegCalendarAlt,
  Poll: FaPollH,
  FaPaperPlane,
  Times: FaTimes,
  Draw: DrawOutlinedIcon,
  Close: CloseIcon,
};

export default Icons;
