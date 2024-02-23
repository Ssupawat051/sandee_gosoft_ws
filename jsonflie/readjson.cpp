#include <iostream>
#include "json/json.hpp"

using json = nlohmann::json;

int main()
{
    json control = {
        {"controls", "001"}
    };

    int cID = jdEmployees.value("controls", 0);
    std::cout << "Control ID : " << cID << std::endl;

    return 0;
}
