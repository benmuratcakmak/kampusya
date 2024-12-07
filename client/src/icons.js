import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

//Update Profile

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

const Icons = {

  //Report
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

  //Update Profile
  AddPhotoAlternateIcon,

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
};

export default Icons;
