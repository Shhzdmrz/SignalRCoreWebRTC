using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRCoreWebRTC.Models
{
    public class CallOffer
    {
        public User Caller;
        public User Callee;
    }

    public class User
    {
        public string Username;
        public string ConnectionId;
        public bool InCall;
    }

    public class UserCall
    {
        public List<User> Users;
    }
}
